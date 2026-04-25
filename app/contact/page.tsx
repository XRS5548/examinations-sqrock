// app/contact/page.tsx
import { Navbar } from "@/websiteComponents/home/Navbar"; 
import { Footer } from "@/websiteComponents/home/Footer"; 
import { Mail, Phone, MapPin } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Contact Us</h1>
          <p className="text-lg text-gray-600">Get in touch with our team</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="text-center p-6 bg-gray-50 rounded-2xl">
            <Mail className="h-8 w-8 text-red-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Email</h3>
            <p className="text-gray-600">support@examinermax.com</p>
          </div>
          <div className="text-center p-6 bg-gray-50 rounded-2xl">
            <Phone className="h-8 w-8 text-red-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Phone</h3>
            <p className="text-gray-600">+91 123 456 7890</p>
          </div>
          <div className="text-center p-6 bg-gray-50 rounded-2xl">
            <MapPin className="h-8 w-8 text-red-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Address</h3>
            <p className="text-gray-600">Mumbai, India</p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}