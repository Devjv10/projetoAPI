import app from "./app";

const PORT = 4000;

app.listen(PORT, () => {
 
  console.log(`Servidor rodando em http://localhost:${PORT}`);
  console.log(`Swagger disponivel em http://localhost:${PORT}/api-docs`);
});
