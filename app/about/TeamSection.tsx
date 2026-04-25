// components/about/TeamSection.tsx
"use client";

const team = [
  {
    name: "Rohit Verma",
    role: "Founder & CEO",
    bio: "Former ed-tech leader with 10+ years of experience",
    image: "/team/rohit.jpg",
  },
  {
    name: "SANIYA KHAN",
    role: "CTO",
    bio: "Expert in scalable systems and exam technologies",
    image: "/team/priya.jpg",
  },
  
];

export function TeamSection() {
  return (
    <div className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-block px-4 py-1 bg-red-50 text-red-600 rounded-full text-sm font-semibold mb-4">
            Leadership
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Driven by Excellence
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Meet the team behind ExaminerMax
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 justify-center gap-8">
          {team.map((member, index) => (
            <div key={index} className="bg-white rounded-2xl overflow-hidden border border-gray-200 hover:shadow-xl transition">
              <div className="h-64 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                <div className="w-32 h-32 rounded-full bg-gray-300 flex items-center justify-center text-4xl">
                  {member.name.charAt(0)}
                </div>
              </div>
              <div className="p-6 text-center">
                <h3 className="text-xl font-bold text-gray-900 mb-1">{member.name}</h3>
                <p className="text-red-600 text-sm font-semibold mb-3">{member.role}</p>
                <p className="text-gray-600 text-sm">{member.bio}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}