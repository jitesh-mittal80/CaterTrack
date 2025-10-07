import { useApp } from '../context/AppContext';

const Greeting = () => {
  const { state } = useApp();
  
  if (!state.user) return null;
  
  return (
    <div className="text-sm text-muted-foreground">
      Hi! <span className="font-medium text-foreground">{state.user.name}</span>
    </div>
  );
};

export default Greeting;