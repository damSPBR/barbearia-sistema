import { useState, useEffect } from "react" //HOOK de gerenciamento para Estado de itens/objetos 

function App() {
  
  const [agenda, setAgenda] = useState([])
  const [dataSelecionada, setDataSelecionada] = useState(new Date().toISOString().split('T')[0]);
  const [nomeCliente, setNomeCliente] = useState("");
  const [descricaoCorte, setDescricaoCorte] = useState("");

  //Criando o Estado: 'Selecionado' guarda o ID do item(horarios), 'setSelecionado' altera o item(horarios)
  //Vou iniciar sempre com null pois nada foi selecionado
  const [selecionado, setSelecionado] = useState(null);

  //FUNÇÃO de LEITURA(GET): busca horarios no banco de dados do leonardo
  //async/await: O JS "espera" a resposta do servidor antes de continuar
  const buscarHorariosDoBackend = async () => {
  try {
    // Enviamos a dataSelecionada como parâmetro (query param) na URL
    const resposta = await fetch(`http://127.0.0.1:8000/horarios?data=${dataSelecionada}`)
    const dados = await resposta.json()
    setAgenda(dados)
  } catch (erro) {
    console.error("Erro ao conectar com o servidor", erro)
    // Fallback: mantém os dados de teste se o servidor estiver offline
    setAgenda([
      { id: 0, horario: "08:00", disponivel: true, cliente: "", descricao: "" },
      { id: 1, horario: "09:00", disponivel: false, cliente: "Marcos", descricao: "Corte e Barba" }
    ])
  }
}


  //COLATERAL: Busca uma UNICA VEZ quando o site carrega
  useEffect(() => {
    buscarHorariosDoBackend();
  }, [dataSelecionada]) //Se for modificado esse arr ele atualiza
  //FUNÇÃO DE ESCRITA(PUT/POST) envia o agendamento para o back end
  const confirmarAgendamento = async () => {
  if (!nomeCliente) return alert("Por favor, digite o nome do cliente!");

  try {
    // O seu Python espera: /agendar/ID?cliente=NOME
    const resposta = await fetch(`http://127.0.0.1:8000/agendar/${selecionado}?cliente=${nomeCliente}`, {
      method: "POST", // O método está correto: POST
    });

    if (resposta.ok) {
      alert("Agendamento realizado com sucesso!");
      setNomeCliente("");
      setDescricaoCorte("");
      setSelecionado(null);
      await buscarHorariosDoBackend(); // Atualiza a lista
    } else {
      const erro = await resposta.json();
      console.error("Erro do servidor:", erro);
      alert("Erro ao agendar. Verifique os dados.");
    }
  } catch (erro) {
    console.error("Erro na requisição:", erro);
    alert("Falha ao conectar com o servidor.");
  }
};

const cancelarAgendamento = async (id) => {
  if (!confirm("Deseja realmente cancelar este horário?")) return;

  try {
    const resposta = await fetch(`http://127.0.0.1:8000/cancelar/${id}`, {
      method: "PUT", // MUDANÇA AQUI: O seu backend exige PUT para cancelar
    });

    if (resposta.ok) {
      alert("Horário liberado!");
      setSelecionado(null);
      await buscarHorariosDoBackend();
    }
  } catch (erro) {
    console.error("Erro ao cancelar:", erro);
    alert("Erro ao conectar com o servidor.");
  }
};
 
  return (
    //Div(PAI) princital com as config para tela inteira e com o flex para centralizar o cartao no meio da tela
    <div className="min-h-screen bg-black flex items-center justify-center">
      {/*Cartão da barbearia
          Fundo cinza - espaçamento(p-10)
          bordas arredondadas - bordas na cor amarela
        */}
      <div className="bg-zinc-800 p-10 rounded-xl border-yellow-300 shadow-2xl">""
        {/*Titulo Principal
          negrito e amarelo - margin-bottom para empurrar o texto debaixo para longe
        */}
        {/* Título do Cartão */}
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-yellow-500 uppercase tracking-widest">
            Barbearia Fusion
          </h1>
          <p className="text-zinc-400 text-sm">Vagas disponiveis: {agenda.filter(h => h.disponivel).length} disponiveis.</p>
        </header>
        <div className="flex flex-col items-center mb-8">
          <label className="text-yellow-500 mb-2 font-bold">Escolha a Data:</label>
          <input 
            type="date" 
            value={dataSelecionada} 
            onChange={(e) => setDataSelecionada(e.target.value)}
            className="bg-zinc-800 text-white p-3 rounded-lg border-2 border-yellow-500 outline-none focus:border-yellow-400 transition-all"/>
          </div>

        {/* A GRADE : Onde organizo os  horarios que vão aparecer
           grid-cols-2 quer dizer 2 colunas gap-3 é o espaçoe entre elas */}
           <div className=" grid grid-cols-2 sm:grid-cols-3 gap-3">
            {/*O MAP: Onde irei fazer a lista(Horarios) ser percorrida a cada item criar um Botão */}
             {agenda.map((item) => (
              <button key={item.id} //Indentificado Unico para o REACT não se perder
                     //OnClick: Quando o botão for clicado a função  setSelecionada vai guardar o ID no Item
                     onClick={()=> setSelecionado(item.id)}
                     disabled={false}
                     /* Lógica de Estilo Dinâmica:
                 1. Se for o selecionado -> Fundo Dourado Forte (bg-yellow-500)
                 2. Se estiver disponível -> Borda amarela e fundo leve
                 3. Se estiver ocupado -> Cinza e travado */
              className={`p-4 rounded-lg border flex flex-col items-center transition-all duration-300 ${
                selecionado === item.id 
                  ? "border-white bg-yellow-500 text-black scale-105 shadow-lg" // Estilo para o escolhido
                  : item.disponivel 
                    ? "border-yellow-600/50 bg-yellow-600/10 text-yellow-500 hover:border-yellow-500" 
                    : "border-zinc-700 bg-zinc-900 text-zinc-600 cursor-not-allowed opacity-50"
              }`}
              >
                {/* Mostra a Hora vindo da minha regra: item.horario */}
                <span className="font-bold text-lg">{item.horario}</span>
                <span className="text-[10px] font-medium uppercase">
                  {selecionado === item.id ? "CONFIRMAR?" : item.disponivel ? "LIVRE" : item.cliente}
                </span>
              </button>
             ))}   
           </div>
           {/*Rodapé : Instrução para Usuario */}
           <footer className="mt-8 text-center border-t border-zinc-700 pt-4 text-zinc-500 text-xs italic">
            * Horários ocupados não permitem agendamento.
           </footer>
           {/** Botão de CONFIRMAÇÃO: so aparece se o houver algo selecionado */}
           
           {/* NOVO PAINEL DINÂMICO DE DETALHES */}
{selecionado !== null && (
  <div className="mt-8 p-6 bg-zinc-900 rounded-xl border border-yellow-500 shadow-2xl animate-in fade-in zoom-in duration-300">
    {(() => {
      // Buscamos os dados completos do horário que você clicou
      const slot = agenda.find(h => h.id === selecionado);
      
      return (
        <>
          <header className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-black text-yellow-500 uppercase">
              Horário: {slot?.horario}
            </h3>
            <button 
              onClick={() => setSelecionado(null)}
              className="text-zinc-500 hover:text-white text-xs"
            >
              [ FECHAR ]
            </button>
          </header>

          {/* TESTE LÓGICO: O horário já tem dono? */}
          {!slot?.disponivel ? (
            /* SE OCUPADO: Mostra quem agendou */
            <div className="bg-zinc-800 p-4 rounded-lg border-l-4 border-red-500">
              <p className="text-zinc-400 text-xs uppercase font-bold">Cliente Agendado</p>
              <p className="text-white text-lg font-bold">{slot?.cliente || "Não informado"}</p>
              
              <p className="text-zinc-400 text-xs uppercase font-bold mt-4">Serviço</p>
              <p className="text-white italic">{slot?.descricao || "Corte padrão"}</p>

              {/* Localize este botão dentro do bloco !slot?.disponivel */}
<button 
  onClick={() => cancelarAgendamento(selecionado)}
  className="mt-6 w-full py-3 bg-zinc-700 text-red-400 font-bold rounded-lg hover:bg-red-600 hover:text-white transition-all"
>
  CANCELAR AGENDAMENTO
</button>
            </div>
          ) : (
            /* SE LIVRE: Mostra o formulário de reserva */
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-[10px] text-yellow-500 font-bold uppercase ml-1">Nome do Cliente</label>
                <input 
                  type="text" 
                  placeholder="Ex: David Silva" 
                  value={nomeCliente}
                  onChange={(e) => setNomeCliente(e.target.value)}
                  className="w-full p-3 rounded-lg bg-zinc-800 text-white border border-zinc-700 outline-none focus:border-yellow-500 transition-all"
                />
              </div>

              <div>
                <label className="text-[10px] text-yellow-500 font-bold uppercase ml-1">O que vamos fazer?</label>
                <textarea 
                  placeholder="Ex: Degradê e barba" 
                  value={descricaoCorte}
                  onChange={(e) => setDescricaoCorte(e.target.value)}
                  className="w-full p-3 rounded-lg bg-zinc-800 text-white border border-zinc-700 outline-none focus:border-yellow-500 h-20 resize-none"
                />
              </div>

              <button 
                onClick={confirmarAgendamento}
                className="mt-2 w-full py-4 bg-yellow-500 text-black font-black rounded-xl hover:bg-yellow-400 transition-all uppercase shadow-lg"
              >
                Confirmar Agendamento
              </button>
            </div>
          )}
        </>
      );
    })()}
  </div>
)}

      </div>
    </div>
  )
}

export default App