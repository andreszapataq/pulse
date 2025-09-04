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
    <div className="mb-12">
      <h2 className="text-lg font-normal text-black mb-3 tracking-wide">
        {title}
      </h2>
      <div className="text-3xl font-normal text-black mb-4 tracking-wide">
        {value}
      </div>
      {showProgressBar && (
        <div className="flex items-center gap-4">
          <div className="flex-1 h-3" style={{ backgroundColor: '#e5e5e5' }}>
            <div 
              className="bg-black h-3 transition-all duration-300" 
              style={{ width: getProgressWidth() }}
            />
          </div>
          {percentage && (
            <span className="text-base min-w-[3rem] text-right font-normal" style={{ color: '#757575' }}>
              {percentage}
            </span>
          )}
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

  return (
    <main className="min-h-screen bg-white px-8 py-12 max-w-md mx-auto font-mono">
      {/* Header */}
      <div className="mb-16">
        <div className="mb-6">
          <p className="text-lg font-bold tracking-[-0.5em]">|   |  || ||| |||||</p> 
        </div>
        
        <div className="flex justify-between items-start">
          <h1 className="text-sm font-semibold">
            BioTissue Colombia
          </h1>
          <span className="text-xs">
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
    </main>
  );
}
