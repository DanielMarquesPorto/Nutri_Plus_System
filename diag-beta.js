import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

async function listModelsBeta() {
    const apiKey = process.env.GOOGLE_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        
        if (!response.ok) {
            console.error("Erro no Beta:", data);
            return;
        }

        console.log("\n--- Modelos Disponíveis (V1BETA) ---");
        data.models.forEach(m => {
            console.log(`- ${m.name}`);
        });
        console.log("------------------------------------\n");
    } catch (error) {
        console.error("Erro:", error.message);
    }
}

listModelsBeta();
