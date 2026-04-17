import Header from "../components/Header";
import Titulo from "../components/Titulo";
import InfoInscripcion from "../components/InfoInscripcion";  
import GenerarRecibo from "../components/GenerarRecibo";
function PagoInscripcionPage(){

    return( <div className="min-h-screen bg-gray-100">
      <Header />
      
      <main className="max-w-6xl mx-auto p-6 space-y-6">
      <Titulo />
      <InfoInscripcion />
      <GenerarRecibo onGenerar={() => alert("Recibo generado")} />
        
      </main>
    </div>
  );
}

export default PagoInscripcionPage;