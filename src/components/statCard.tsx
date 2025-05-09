export default function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
        <div className="bg-blue-100 p-3 rounded-full mr-4">{icon}</div>
        <div>
          <h3 className="text-gray-500">{label}</h3>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </div>
    );
  }