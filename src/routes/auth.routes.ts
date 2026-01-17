import express from 'express'; 
import { signupController } from '../controller/auth.controller.js';

const app = express();

const router = express.Router();

// for post 

router.post("/signup", signupController)

export default router;


