import dotenv from "dotenv";
import fetch from "node-fetch";
import { z } from "zod";

dotenv.config();

// --- SCHEMA DE VALIDAÇÃO ZOD ---
const RefeicaoSchema = z.array(z.string()).min(3).max(3);

const DiaSchema = z.object({
  dia: z.string(),
  refeicoes: z.object({
    cafe_da_manha: RefeicaoSchema,
    lanche_manha: RefeicaoSchema,
    almoco: RefeicaoSchema,
    lanche_tarde: RefeicaoSchema,
    jantar: RefeicaoSchema
  })
});

const PlanoAlimentarSchema = z.object({
  plano_semanal: z.array(DiaSchema).length(7)
});

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });

  const { patientData } = req.body;
  const apiKey = process.env.GOOGLE_API_KEY;

  if (!apiKey) return res.status(500).json({ error: "Chave de API não configurada." });

  const prompt = `
Você é um nutricionista profissional. Gere um plano alimentar semanal rigoroso.
ESTRUTURA JSON OBRIGATÓRIA:
{
  "plano_semanal": [
    {
      "dia": "Segunda-feira",
      "refeicoes": {
        "cafe_da_manha": ["opção 1", "opção 2", "opção 3"],
        "lanche_manha": ["opção 1", "opção 2", "opção 3"],
        "almoco": ["opção 1", "opção 2", "opção 3"],
        "lanche_tarde": ["opção 1", "opção 2", "opção 3"],
        "jantar": ["opção 1", "opção 2", "opção 3"]
      }
    }
  ]
}
REGRAS:
1. Exatamente 7 dias.
2. Exatamente 3 opções por refeição.
3. Apenas JSON puro, sem markdown.

Dados do paciente:
${JSON.stringify(patientData, null, 2)}
`;

  const models = ["gemini-3.1-flash-lite-preview", "gemini-2.5-flash", "gemini-2.0-flash-lite"];
  const MAX_RETRIES = 3;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    console.log(`\n--- Tentativa ${attempt} de ${MAX_RETRIES} ---`);
    
    for (const modelName of models) {
      try {
        console.log(`Chamando ${modelName}...`);
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
        
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });

        const result = await response.json();
        if (!response.ok) continue;

        let rawText = result.candidates[0].content.parts[0].text;
        
        // Extração robusta do JSON
        const firstBrace = rawText.indexOf('{');
        const lastBrace = rawText.lastIndexOf('}');
        if (firstBrace === -1 || lastBrace === -1) throw new Error("JSON não encontrado na resposta");
        
        let jsonContent = JSON.parse(rawText.substring(firstBrace, lastBrace + 1));

        // --- NORMALIZAÇÃO ANTES DO ZOD ---
        // Se a IA usou "plano_alimentar" ou enviou objeto direto, convertemos para o formato que o Zod exige
        if (jsonContent.plano_alimentar && !jsonContent.plano_semanal) {
            const diasMap = {
                'segunda': 'Segunda-feira', 'terca': 'Terça-feira', 'quarta': 'Quarta-feira',
                'quinta': 'Quinta-feira', 'sexta': 'Sexta-feira', 'sabado': 'Sábado', 'domingo': 'Domingo',
                'segunda_feira': 'Segunda-feira', 'terca_feira': 'Terça-feira', 'quarta_feira': 'Quarta-feira',
                'quinta_feira': 'Quinta-feira', 'sexta_feira': 'Sexta-feira'
            };

            const rawData = jsonContent.plano_alimentar;
            
            // Converte objeto de dias em array de objetos
            if (!Array.isArray(rawData)) {
                jsonContent = {
                    plano_semanal: Object.entries(rawData).map(([key, value]) => ({
                        dia: diasMap[key.toLowerCase()] || key,
                        refeicoes: value
                    }))
                };
            } else {
                jsonContent = { plano_semanal: rawData };
            }
        }

        // --- VALIDAÇÃO COM ZOD ---
        const validation = PlanoAlimentarSchema.safeParse(jsonContent);

        if (validation.success) {
          console.log("✅ Dados validados com sucesso pelo Zod!");
          return res.status(200).json(validation.data);
        } else {
          console.warn("❌ Falha na validação do Zod:", validation.error.format());
          // Se falhou na validação, vamos para a próxima tentativa de geração
          throw new Error("Dados fora do padrão esperado");
        }

      } catch (err) {
        console.error(`Erro no modelo ${modelName}:`, err.message);
      }
    }
  }

  res.status(500).json({ error: "A IA falhou em gerar dados consistentes após várias tentativas." });
}
