export default function ActionButton({ icon, label, onClick, color }: { icon: React.ReactNode; label: string; onClick: () => void; color: string }) {
    return (
      <button onClick={onClick} className={`bg-${color}-600 text-white p-6 rounded-lg shadow-md hover:bg-${color}-700 transition-colors flex items-center justify-center`}>
        {icon}
        <span className="text-xl mx-2">{label}</span>
      </button>
    );
  }
  