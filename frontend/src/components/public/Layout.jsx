import { Outlet } from 'react-router-dom'
import Navbar from "./Navbar";
import Footer from "./Footer";
import FloatingCartButton from './FloatingCartButton';
import PromoCardModal from './PromoCardModal';

export default function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAF8]">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <PromoCardModal />
      <FloatingCartButton />
      <Footer />
    </div>
  )
}
