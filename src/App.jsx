import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import AIToolPage from './pages/AIToolPage';
import ResultPage from './pages/ResultPage';
import ResizePage from './pages/ResizePage';
import CompressPage from './pages/CompressPage';
import ConvertPage from './pages/ConvertPage';
import PDFToolsPage from './pages/PDFToolsPage';
import BackgroundRemovePage from './pages/BackgroundRemovePage';
import CloudinaryToolsPage from './pages/CloudinaryToolsPage';
import CropPage from './pages/CropPage';
import WatermarkRemovePage from './pages/WatermarkRemovePage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="ai-tool" element={<AIToolPage />} />
        <Route path="cloudinary-tools" element={<CloudinaryToolsPage />} />
        <Route path="result" element={<ResultPage />} />
        <Route path="resize" element={<ResizePage />} />
        <Route path="compress" element={<CompressPage />} />
        <Route path="convert" element={<ConvertPage />} />
        <Route path="crop" element={<CropPage />} />
        <Route path="pdf-tools" element={<PDFToolsPage />} />
        <Route path="background-remove" element={<BackgroundRemovePage />} />
        <Route path="watermark-remove" element={<WatermarkRemovePage />} />
      </Route>
    </Routes>
  );
}

export default App;
