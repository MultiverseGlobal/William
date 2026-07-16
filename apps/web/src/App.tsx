import { useState, useEffect } from 'react';
import { Onboarding } from './components/Onboarding';
import { Dashboard } from './components/Dashboard';
import type { ConstitutionRule, ContextState, Integration } from '@william/types';

interface AppState {
  username: string;
  profile: { name: string; role: string; avatar: string };
  rules: ConstitutionRule[];
  context: Partial<ContextState>;
  integrations: Integration[];
}

function App() {
  const [appState, setAppState] = useState<AppState | null>(null);
  const [isOnboarded, setIsOnboarded] = useState<boolean>(false);

  useEffect(() => {
    const savedState = localStorage.getItem('william_workspace_state');
    const savedOnboarded = localStorage.getItem('william_onboarding_complete');
    
    if (savedOnboarded === 'true' && savedState) {
      try {
        setAppState(JSON.parse(savedState));
        setIsOnboarded(true);
      } catch (e) {
        console.error('Error parsing persisted state', e);
        localStorage.clear();
      }
    }
  }, []);

  const handleOnboardingComplete = (data: AppState) => {
    localStorage.setItem('william_workspace_state', JSON.stringify(data));
    localStorage.setItem('william_onboarding_complete', 'true');
    setAppState(data);
    setIsOnboarded(true);
  };

  const handleReset = () => {
    localStorage.removeItem('william_workspace_state');
    localStorage.removeItem('william_onboarding_complete');
    setAppState(null);
    setIsOnboarded(false);
  };

  return (
    <>
      {isOnboarded && appState ? (
        <Dashboard initialData={appState} onReset={handleReset} />
      ) : (
        <Onboarding onComplete={handleOnboardingComplete} />
      )}
    </>
  );
}

export default App;
