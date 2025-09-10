interface MetricCardProps {
  title: string;
  value: string;
  percentage?: string;
  showProgressBar?: boolean;
}

function MetricCard({ title, value, percentage, showProgressBar = false }: MetricCardProps) {
  const getProgressWidth = () => {
    if (!percentage) return '0%';
    return percentage;
  };

  return (
    <div className="mb-10">
      <h2 className="text-base font-medium leading-tight">
        {title}
      </h2>
      <div className="flex justify-between items-baseline mb-[3px]">
        <div className="text-xl font-normal">
          {value}
        </div>
        {percentage && (
          <span className="text-sm font-normal text-gray-500">
            {percentage}
          </span>
        )}
      </div>
      {showProgressBar && (
        <div className="w-full h-[10px]">
          <div 
            className="bg-linear-to-r from-background to-foreground h-full" 
            style={{ width: getProgressWidth() }}
          />
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const currentDate = new Date().toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  const lastUpdateTime = new Date().toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  return (
    <main className="min-h-screen bg-white px-9 py-13 max-w-md mx-auto font-mono">
      {/* Header */}
      <div className="mb-[50px]">
        <div>
          <img src="/logo.svg" alt="Pulse Logo" className="h-4 w-auto ml-px mb-px" />
        </div>
        
        <div className="flex justify-between items-start">
          <h1 className="text-sm font-semibold">
            BioTissue Colombia
          </h1>
          <span className="text-xs font-normal">
            {currentDate}
          </span>
        </div>
      </div>

      {/* Metrics */}
      <div>
        <MetricCard
          title="Ventas"
          value="$120.000.000"
          percentage="85%"
          showProgressBar={true}
        />
        
        <MetricCard
          title="Recaudo"
          value="$135.000.000"
          percentage="92%"
          showProgressBar={true}
        />
        
        <MetricCard
          title="Inventario"
          value="$300.000.000"
          percentage="100%"
          showProgressBar={true}
        />
        
        <MetricCard
          title="Margen"
          value="30%"
          percentage="33%"
          showProgressBar={true}
        />
        
        <MetricCard
          title="Caja"
          value="$78.000.000"
          percentage="100%"
          showProgressBar={true}
        />
      </div>

      {/* Footer with last update time */}
      <div className="mt-24 text-center">
        <span className="text-xs font-normal text-gray-500">
          Última actualización: {lastUpdateTime}
        </span>
      </div>
    </main>
  );
}
