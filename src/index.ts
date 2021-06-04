import express, { Request, Response } from "express";
import { IncomingMessage, request } from "http";
import { v4 as uuidv4 } from 'uuid';
import cors from "cors";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

class User {
    userId: string;
    name: string;
    cpf: string;
    email: string;
    age: number;
    transactions: Transactions[] = []

    constructor (userId: string, name: string, cpf: string, email: string, age: number) {
        this.userId = userId;
        this.name = name
        this.cpf = cpf
        this.email = email
        this.age = age
    }
}

class Transactions {
    transactionId: number
    title: string;
    value: number;
    type: string;

    constructor (transactionId: number, title: string, value: number, type: string) {
        this.transactionId = transactionId;
        this.title = title
        this.value = value
        this.type = type
    }
}

let users: any[] = [];
app.post("/users", (request: Request, response: Response) => {
    const { name, cpf, email, age } = request.body;
    let novoId = uuidv4();

    const user = new User(novoId, name, cpf, email, age);
    const exist = users.find((f) => {
    return f.cpf === cpf;
  });

  if(exist) {
    return response.status(400).json(`${name} já cadastrado no cpf: ${exist.cpf}`);
  }
    users.push(user)

    return response.status(200).json({
        id: novoId,
        name: name,
        cpf: cpf,
        email: email,
        age: age
        }
    )
  })

  app.get("/users/", (request: Request, response: Response) => {

    return response.status(200).json({
        users: users
    })
  })

  app.get("/users/:userId", (request: Request, response: Response) => {
    const { userId }: { userId?: string } = request.params;
    const user = users.find((f) => {
      return f.userId === userId;
    });
    return response.status(200).json(user);
  });

  app.delete("/users/:userId", (request: Request, response: Response) => {
    const { userId }: { userId?: string } = request.params;

    const indexUsuario = users.findIndex((f) => {
       return f.userId === userId; });
       
    if (indexUsuario === -1) {
      return response.status(404).json({
        msg: "Usuário não encontrado", 
      })
    }

    const user = users.splice(indexUsuario, 1);
  
    return response.status(200).json(user);
  });

  app.put("/users/:userId", (request: Request, response: Response) => {
    const { userId }: { userId?: string } = request.params;
    const { name, cpf, email, age }: { name: string; cpf: string; email: string, age: string } = request.body;
  
    const user = users.find((f) => {
      return f.userId === userId;
    });
  
    if (!user) {
      return response.status(404).json({
        msg: "Usuário não encontrado",
      });
    }
  
    user.name = name;
    user.cpf = cpf;
    user.email = email;
    user.age = age;
  
    return response.status(200).json(user);
  });
  
  let idTransaction = -1;
  app.post("/users/:userId/transactions", (request: Request, response: Response) => {
    const { userId }: { userId?: string } = request.params;
    const { title, value, type }: { title: string, value: number, type: string } = request.body;
    let novoId = idTransaction + 1;
    idTransaction++;

    const transaction = new Transactions(novoId, title, value, type);
    
    const user = users.find((f) => {
      return f.userId === userId;
    });

    user.transactions.push(transaction);   

    return response.status(200).json({
        id: novoId,
        title: title,
        value: value,
        type: type, 
        }
    )
  })

  app.get("/users/:userId/transactions", (request: Request, response: Response) => { 
    const { userId }: { userId?: string } = request.params;

      const user = users.find((f) => {
        return f.userId === userId;
      });

      const filterIncome = user.transactions
      .filter((f:any) => {return f.type === "income";})
      .reduce((total:number, item: any) => {return total + item.value;}, 0);
        
      const filterOutcome = user.transactions
        .filter((f:any) => {return f.type === "outcome";})
        .reduce((total:number, item: any) => {return total + item.value;}, 0);

      const balance = filterIncome - filterOutcome;
      
    return response.status(200).json({
          transactions: user.transactions,
          income: filterIncome,
          outcome: filterOutcome,
          total: balance
    })
  })

  //nao consegui
  app.delete("/users/:userId/transactions/:transactionId", (request: Request, response: Response) => {
    const { userId, transactionId }: { userId?: string, transactionId?: number  } = request.params;

    const user = users.find((f) => {
      return f.userId === userId;
    });
    
    const indexUsuario = users.findIndex((f) => {
      return f.userId === userId; });



      // NAO CONSEGUI BUSCAR O INDICE DA TRANSACTION DE NENHUMA FORMA
      // ESTÁ RETORNANDO -1 EM AMBAS TENTATIVAS
      const indexTransaction = user.transactions.findIndex((f:any) => {
      return f.transactions.transactionId === transactionId;
     })
      const indexTransaction2 = user.transactions.indexOf(transactionId, 0);
      console.log(indexTransaction)
      console.log(indexTransaction2)





    if (indexUsuario === -1) {
      return response.status(404).json({ 
        msg: "Usuário não encontrado.",
      });
    }
    if (indexTransaction === -1) {
      return response.status(404).json({
        msg: "Não há transações.",
      });
    }
  
    const transaction = user.transaction.splice(indexTransaction, 1);
  
    return response.status(200).json(transaction);
  });


  //nao consegui
  app.put("/users/:id/transactions/:transactionId", (request: Request, response: Response) => {
    const { userId, transactionId }: { userId?: string, transactionId?: any } = request.params;
    const { title, value, type }: { title: string; value: number; type: string } = request.body;
  
    const user = users.find((f) => {
      return f.userId === userId;
    });

    const transaction = user.transactions.find((f:any) => {
      return f.transactionId === transactionId;
    })
  
    if (!user) {
      return response.status(404).json({
        msg: "Usuário não encontrado",
      });
    }

    if (!transaction) {
      return response.status(404).json({
        msg: "Transação não encontrado",
      });
    }
  
    user.transaction.title = title;
    user.transaction.value = value;
    user.transaction.type = type;
  
    return response.status(200).json({
      id: transactionId,
      title: title,
      value: value,
      type: type, 
      }
  )
})


app.listen(process.env.PORT || 3000, () => {
    console.log("Servidor rodando...");
});
