import { useRoutes } from 'react-router-dom';
import { routes } from './routes';

const AppRouter = () => {
  return useRoutes(routes);
}

function App() {
  return <AppRouter/>
}

export default App;