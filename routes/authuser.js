import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const SECRET_WORD = process.env.SECRET_KEY;

// Função para gerar o token JWT

export function validationLogin(id_user) {
    if (!id_user) {
        throw new Error("id_user é obrigatório para gerar o token.");
    }

    console.log("Passo 5: Gerando token...");
    
    try {
        const token = jwt.sign({ id: id_user }, SECRET_WORD, { expiresIn: "1h" });
        console.log(token)
        console.log("Passo 6: Token gerado com sucesso!");
        return token;
    } catch (error) {
        console.error("Erro ao gerar token:", error);
        throw error; // Lança erro para ser capturado no código chamador
    }
}
export function authMiddleware(req, res, next) {
    // Verifique se o cabeçalho 'Authorization' está presente

    const token = req.cookies.token
    console.log('COOKIE AUTHUSER  :: ', token)
    if (!token) {
        console.log("❌ Token não fornecido!");
        return res.status(401).json({ message: 'Token não fornecido' });
    }

    try {
        const decoded = jwt.verify(token, SECRET_WORD);
        console.log("✅ Token decodificado:", decoded);
        req.user = decoded;
        next();
    } catch (error) {
        console.log("❌ Erro ao verificar token:", error.message);
        return res.status(401).json({ message: 'Token inválido' });
    }
}
