import React, { createContext, useContext, useState } from 'react';

type Branch = {
  id: string;
  restaurantId: string;
  name: string;
};

type SelectedBranchContextType = {
  selectedBranch: Branch | null;
  setSelectedBranch: (branch: Branch | null) => void;
};

const SelectedBranchContext = createContext<SelectedBranchContextType | undefined>(undefined);

export function SelectedBranchProvider({ children }: { children: React.ReactNode }) {
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  return (
    <SelectedBranchContext.Provider value={{ selectedBranch, setSelectedBranch }}>
      {children}
    </SelectedBranchContext.Provider>
  );
}

export const useSelectedBranch = () => {
  const context = useContext(SelectedBranchContext);
  if (!context) throw new Error('useSelectedBranch must be used within SelectedBranchProvider');
  return context;
}; 