import React, { useState, useEffect } from "react";
import PropertyComponent from "../components/Property";
const Demo: React.FC = () => {

    useEffect(() => {
        console.log("Componente montado");
        return () => {
            console.log("Componente desmontado");
        };
    }, []);

    //Aqui se programa en type script

    let [name, setName] = useState("Felipe"); //useState me permite manipular la variable desde el HTML
    let fabian: string = "Hola me llamo fabian";
    let [reactName, setReactName] = useState("Fabitox"); // Variable reactiva

    //Funcion para manejar los cambios de la variable reactiva
    const cambioReact = (evento: any) => {
        setReactName(evento.target.value);
    }

    const clickButton = () => {
        console.log(`Esto es un log para ${reactName}`);
    }

    let [edad, setEdad] = useState(0);

    const manejarEdad = (event:any) => {
        setEdad(event.target.value);
    }

    let activo: boolean = true;
    let poderes: string[] = ["volar", "fuerza", "velocidad"];

    // Función para manejar los cambios en la caja de texto
    const manejarCambio = (event: any) => {
        setName(event.target.value); // Actualizar el estado con el valor del input
    };
    const manejarClick = () => {
        console.log(`Hola, ${name}`); // Mostrar el saludo en la consola
    }

    //Este es HTML
    return <div>
        <p>Hola mundo {name}</p>
        
        <p>{fabian}</p>
        <p>Esto es una variable reactiva: {reactName}</p>
        <label htmlFor="reactName">Variable reactiva: </label>
        <input
            id="reactName"
            type="text"
            value={reactName}
            onChange={cambioReact}
        />
        <button onClick={clickButton}>
            Console log
        </button>
        <p>
            {["a", "e", "i", "o", "u"].includes(reactName?.[0]?.toLowerCase())
                ? "Es vocal"
                : "No es vocal"}
        </p>
        <p>Edad: {edad}</p>
        <input 
        type="number" 
        value={edad}
        onChange={manejarEdad}
        />
        <p>{edad >= 18 ? "Mayor de edad" : "Menor de edad"}</p>
        <p>Poderes</p>
        <ul>
            {poderes.map(poder => <li>{poder}</li>)}
        </ul>
        <input
            type="text"
            value={name} // El valor del input está ligado al estado 'texto'
            onChange={manejarCambio} // Se actualiza el estado cada vez que el usuario escribe
        />
        <button onClick={manejarClick}>Saludar</button>
        <div className="row">
            <div className="col-3">
                <PropertyComponent name="Propiedad 1" color="red" price={100} rent={[10, 20, 30]} />
            </div>
        </div>
    </div>;

}
export default Demo;
