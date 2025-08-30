import React from 'react';

interface Commission {
  id: number;
  dealId: number;
  salesAgentId: number;
  ruleId: number;
  amount: string;
  calculatedAt: string;
}

interface CommissionTableProps {
  commissions: Commission[];
  loading: boolean;
}

const CommissionTable: React.FC<CommissionTableProps> = ({ commissions, loading }) => {
  if (loading) {
    return <div className="flex justify-center p-8">Loading commissions...</div>;
  }

  if (commissions.length === 0) {
    return <div className="text-center p-8">No commissions found.</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200">
        <thead className="bg-gray-100">
          <tr>
            <th className="py-2 px-2 sm:px-4 border-b text-left text-xs sm:text-sm font-medium">Deal ID</th>
            <th className="py-2 px-2 sm:px-4 border-b text-left text-xs sm:text-sm font-medium">Amount</th>
            <th className="py-2 px-2 sm:px-4 border-b text-left text-xs sm:text-sm font-medium">Calculated At</th>
          </tr>
        </thead>
        <tbody>
          {commissions.map((commission) => (
            <tr key={commission.id} className="hover:bg-gray-50">
              <td className="py-2 px-2 sm:px-4 border-b text-sm sm:text-base">{commission.dealId}</td>
              <td className="py-2 px-2 sm:px-4 border-b text-sm sm:text-base font-medium">${commission.amount}</td>
              <td className="py-2 px-2 sm:px-4 border-b text-sm sm:text-base">
                {new Date(commission.calculatedAt).toLocaleDateString()}
                <div className="text-xs text-gray-500 sm:hidden">
                  {new Date(commission.calculatedAt).toLocaleTimeString()}
                </div>
                <div className="hidden sm:inline">
                  {' ' + new Date(commission.calculatedAt).toLocaleTimeString()}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CommissionTable;
