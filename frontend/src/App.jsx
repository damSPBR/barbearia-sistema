import { useState, useEffect } from "react" //HOOK de gerenciamento para Estado de itens/objetos 

function App() {
  
  const [agenda, setAgenda] = useState([])

  //Criando o Estado: 'Selecionado' guarda o ID do item(horarios), 'setSelecionado' altera o item(horarios)
  //Vou iniciar sempre com null pois nada foi selecionado
  const [selecionado, setSelecionado] = useState(null);

  //FUNÇÃO de LEITURA(GET): busca horarios no banco de dados do leonardo
  //async/await: O JS "espera" a resposta do servidor antes de continuar
  const buscarHorariosDoBackend = async () => {
    try {
      //aqui vai o link do backend 
    const resposta = await fetch("http://127.0.0.1:8000/horarios")
    const dados = await resposta.json()//Traduz os dados recebidos para o JS
    setAgenda(dados) //Preenche a tela com os dados do Banco
    } catch (erro) {
      console.error("Erro ao conectar com o servidor", erro)
      //fallback: se o backend estiver off Carregue  os dados de test
      setAgenda([
        { id: 0, horario: "08:00", disponivel: true, cliente: "" },
        { id: 1, horario: "09:00", disponivel: false, cliente: "Marcos"}
      ])
    }
  }


  //COLATERAL: Busca uma UNICA VEZ quando o site carrega
  useEffect(() => {
    buscarHorariosDoBackend();
  }, []) //ESSE ARRAY VAZIO significa execute apenas na primeira vez que a pagina carregar
  //FUNÇÃO DE ESCRITA(PUT/POST) envia o agendamento para o back end
  const confirmarAgendamento = async () => {
    try {
      //dispara o avisa para o back alterar o status do banco
      const resposta = await fetch(`http://127.0.0.1:8000/agendar/${selecionado}?cliente=KMAZO`, {
        method: "POST", //PosT é usado para atualizar um dado existente
        headers: { "Content-type": "application/json" },
      })
      //Se o back confirmar que salvou atualizamos a tela buscando a lista nova
      if(resposta.ok){
      await buscarHorariosDoBackend()
      setSelecionado(null)//Limpa a seleção
      alert("Agendamento confirmado com sucesso!")
      }else{
        alert("ERRO no servidor")
      }
    }catch (erro) {
      console.error("Erro ao Salvar agendamento", erro)
      alert("Falha ao agendar. Verifique a conexão com o servidor")
    }
  }
 
  return (
    //Div(PAI) princital com as config para tela inteira e com o flex para centralizar o cartao no meio da tela
    <div className="min-h-screen bg-black flex items-center justify-center">
      {/*Cartão da barbearia
          Fundo cinza - espaçamento(p-10)
          bordas arredondadas - bordas na cor amarela
        */}
      <div className="bg-zinc-800 p-10 rounded-xl border-yellow-300 shadow-2xl">
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
        {/* A GRADE : Onde organizo os  horarios que vão aparecer
           grid-cols-2 quer dizer 2 colunas gap-3 é o espaçoe entre elas */}
           <div className=" grid grid-cols-2 sm:grid-cols-3 gap-3">
            {/*O MAP: Onde irei fazer a lista(Horarios) ser percorrida a cada item criar um Botão */}
             {agenda.map((item) => (
              <button key={item.id} //Indentificado Unico para o REACT não se perder
                     //OnClick: Quando o botão for clicado a função  setSelecionada vai guardar o ID no Item
                     onClick={()=> setSelecionado(item.id)}
                     disabled={!item.disponivel}
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
           {selecionado !== null && (
            <button onClick={confirmarAgendamento} 
                className=" mt-6 w-full py-4 bg-white text-black font-black rounded-xl hover:bg-yellow-500 transition-all uppercase tracking-tighter shadow-lg animate-pulse">
              Confirmar Reserva para {agenda.find(h => h.id === selecionado)?.horario}
            </button>
           )}

      </div>
    </div>
  )
}

export default App