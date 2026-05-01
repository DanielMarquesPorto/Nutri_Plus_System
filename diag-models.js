import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

async function listModels() {
    const apiKey = process.env.GOOGLE_API_KEY;
    console.log("Testando chave:", apiKey ? "Configurada (OK)" : "NÃO CONFIGURADA");
    
    const url = `https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        
        if (!response.ok) {
            console.error("Erro ao listar modelos:", data);
            return;
        }

        console.log("\n--- Modelos Disponíveis na sua conta ---");
        data.models.forEach(m => {
            console.log(`- ${m.name} (Suporta: ${m.supportedGenerationMethods.join(", ")})`);
        });
        console.log("---------------------------------------\n");
    } catch (error) {
        console.error("Falha na conexão:", error.message);
    }
}

listModels();
