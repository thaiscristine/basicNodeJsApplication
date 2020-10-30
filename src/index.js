const express = require('express');
const { uuid, isUuid } = require('uuidv4');

const app = express();
app.use(express.json());


const projects = [];

// Middleware de contagem de tempo de cada rota
function logRequests(request, response, next) {
    // collect method and url values from the request
  const { method, url } = request;

    // add data to log label const 
    const logLabel = `[${method.toUpperCase()}] ${url}`;

    // start a contagem de tempo da requisição
    console.time(logLabel);
    // continua o código para com a próxima rotina (rota get por exemplo)
    next();
    // finaliza o timer quando a rotina anterior foi finalizada 
    console.timeEnd(logLabel);
}

// Middleware para validar id do projeto
function validateProjectId(request, response, next) {
    const { id } = request.params;
    // verifica se o id é um padrão uuid
    if(!isUuid(id)) {
        return response.status(400).json({ error: 'Invalid project ID.'});
    }
    // se validado, continue para próxima rota
    return next();
}

// Adicionando o middleware para todas as rotas que utilizam projects/:id
app.use('/projects/:id', validateProjectId);

// adicionando o middleware para todas as rotas. Poderia ser add só para uma ou algumas rotas também
app.use(logRequests);

// Rota de listagem
app.get('/projects', (request, response) => {

    // coleta o filtro passado por query params
    const { title } = request.query;

    const results = title
    // se existe valor no titulo, filtra o campo titulo de acordo com a query
    ? projects.filter(project => project.title.includes(title)) 
    // se não nenhum filtro foi passado, retorna todos
    : projects
    
    // retorna o resultado
    return response.json(results);
});
app.post('/projects', (request, response) => {
    const { title, owner } = request.body;
    
    const project = { id: uuid(), title, owner };
    projects.push(project)
    return response.json(project);
});

app.put('/projects/:id', (request, response) => {
    
    // Coleta o recurso id pelo request.params    
    const { id } = request.params;
    // Coleta dados do body ter dados atualizados do project
    const { title, owner } = request.body;

    // Procura dentro dos projetos pelo o projeto com o mesmo id
    const projectIndex = projects.findIndex(project => project.id === id);

    // Se não existir o projeto, retorna erro. Adiciona status de problema no servidor
    if(projectIndex < 0 ){
        return response.status(400).json({ error: 'project not found'})
    }

    // Novos dados do project
    const project = { id, title, owner }

    // atualiza o array projects na index do project procurado anteriormente com os novos dados do project
    projects[projectIndex] = project;

    // retorna apenas o project atualizado
    return response.json(project);
})

app.delete('/projects/:id', (request, response) => {
    // coleta id pelo request params
    const { id } = request.params;

    // localiza a index do id enviado no array
    const projectIndex = projects.findIndex(project => project.id === id);

    // retorna erro se o id nao for localizado
    if(projectIndex < 0 ){
        return response.status(400).json({ error: 'project not found'})
    }

    // deleta 1 posição do array no index indicado (projectIndex)
    projects.splice(projectIndex, 1);

    // não retorna mensagem, porém retorna código de sucesso
    return response.status(200).send();
})

app.listen(3333, () => {
    console.log('Mãe ta on! 👻')
});