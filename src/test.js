 function thing(d){
 const emptyItem = new UseCase('[none]',[]);

    const uc = d.reduce( (acc,ele) => {
      const nextUseCaseNames = ele.usecase;
      if(Array.isArray(nextUseCaseNames)){
          for(let i = 0; i < nextUseCaseNames.length; i++){
            let hasValidUseCase = false;
            for(let j =0; j < acc.length; j++){
                if(acc[j].name === nextUseCaseNames[i]){ //use case matches an item in array
                  acc[j].items.push(ele);
                  hasValidUseCase = true;
                }
            }
            if(!hasValidUseCase){ //new use case
                const newUseCase = new UseCase(nextUseCaseNames[i],[ele]);
                acc.push(newUseCase);
            }
          }
        }else
          acc[0].items.push(ele); //empty use case array
        
        return acc;

    }, [emptyItem]);
    console.log(uc.map(ele=>{
        return {
            name:ele.name,
            num:ele.items.length
        }
    }))
}

class UseCase{
 
  constructor(name,items){
    this.name = name;
    this.items = items;
  }
}

const fs = require("fs");
//console.log(JSON.parse(fs.readFileSync("./data2.json")));
thing(JSON.parse(fs.readFileSync("./data2.json")));