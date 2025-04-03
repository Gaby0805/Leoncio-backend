import { scheduleJob } from 'node-schedule';
//refatorar esse codigo amanha na aula
//recriar todo a logica base



function scheduleEmail(emprestimo, nome, sobrenome) {
  const { data_limite } = emprestimo;

  const dataEnvio = new Date(data_limite);

  if (dataEnvio <= new Date()) {
    console.log('Data de envio já passou. Email não agendado.');
    return;
  }

  try{
    scheduleJob(data_limite, () => {
      Enviar(
        'Lembrete de Empréstimo',
        `O emprestimo do ${nome} ${sobrenome} passou o prazo de três meses, por favor olhe o site para o contato`
      );
    });
  }
  catch (err) {
    console.log(err, 'erro no organize')
  }
}


export default scheduleEmail