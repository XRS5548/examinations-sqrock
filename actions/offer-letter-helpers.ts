// actions/offer-letter-helpers.ts
// ❌ NO "use server" in this file

/**
 * Get designation based on student's chosen domain (PRIMARY)
 * Falls back to exam name if domain is not provided
 */
export function getDesignation(
  examName: string,
  domain?: string | null
): string {
  // ✅ PRIORITY 1: Use student's chosen domain
  if (domain && domain.trim().length > 0) {
    const d = domain.toLowerCase().trim();

    if (d.includes("full stack")) return "Full Stack Developer Intern";
    if (d.includes("web development")) return "Web Development Intern";
    if (d.includes("frontend") || d.includes("front-end") || d.includes("front end"))
      return "Frontend Development Intern";
    if (d.includes("backend") || d.includes("back-end") || d.includes("back end"))
      return "Backend Development Intern";
    if (d.includes("python")) return "Python Development Intern";
    if (d.includes("java") && !d.includes("javascript"))
      return "Java Development Intern";
    if (d.includes("javascript") || d.includes("js"))
      return "JavaScript Development Intern";
    if (d.includes("android")) return "Android Development Intern";
    if (d.includes("ios")) return "iOS Development Intern";
    if (d.includes("data science")) return "Data Science Intern";
    if (d.includes("machine learning") || d.includes("ml") || d.includes("ai"))
      return "AI/ML Intern";
    if (d.includes("cyber") || d.includes("security"))
      return "Cyber Security Intern";
    if (d.includes("digital marketing"))
      return "Digital Marketing Intern";
    if (d.includes("ui/ux") || d.includes("ui") || d.includes("ux") || d.includes("design"))
      return "UI/UX Design Intern";
    if (d.includes("c++") || d.includes("cpp"))
      return "C++ Development Intern";
    if (d.includes("c programming") || d === "c")
      return "C Programming Intern";
    if (d.includes("devops")) return "DevOps Intern";
    if (d.includes("cloud")) return "Cloud Engineering Intern";
    if (d.includes("blockchain")) return "Blockchain Development Intern";
    if (d.includes("flutter")) return "Flutter Development Intern";
    if (d.includes("react native")) return "React Native Intern";
    if (d.includes("node")) return "Node.js Development Intern";
    if (d.includes("php")) return "PHP Development Intern";
    if (d.includes("golang") || d.includes("go language"))
      return "Go Development Intern";
    if (d.includes("rust")) return "Rust Development Intern";
    if (d.includes("database") || d.includes("sql"))
      return "Database Intern";
    if (d.includes("testing") || d.includes("qa"))
      return "QA Testing Intern";
  }

  // ✅ FALLBACK: Use exam name
  const name = (examName || "").toLowerCase();

  if (name.includes("full stack")) return "Full Stack Developer Intern";
  if (name.includes("web")) return "Web Development Intern";
  if (name.includes("frontend")) return "Frontend Development Intern";
  if (name.includes("backend")) return "Backend Development Intern";
  if (name.includes("python")) return "Python Development Intern";
  if (name.includes("java")) return "Java Development Intern";
  if (name.includes("android")) return "Android Development Intern";
  if (name.includes("data science")) return "Data Science Intern";
  if (name.includes("cyber")) return "Cyber Security Intern";
  if (name.includes("digital marketing")) return "Digital Marketing Intern";
  if (name.includes("ui") || name.includes("ux")) return "UI/UX Design Intern";
  if (name.includes("c++")) return "C++ Development Intern";

  return "Software Development Intern";
}

/**
 * Get department based on student's chosen domain (PRIMARY)
 * Falls back to exam name if domain is not provided
 */
export function getDepartment(
  examName: string,
  domain?: string | null
): string {
  // ✅ PRIORITY 1: Use student's chosen domain
  if (domain && domain.trim().length > 0) {
    const d = domain.toLowerCase().trim();

    if (d.includes("full stack")) return "Full Stack Development";
    if (d.includes("web development")) return "Web Development";
    if (d.includes("frontend") || d.includes("front-end"))
      return "Frontend Development";
    if (d.includes("backend") || d.includes("back-end"))
      return "Backend Development";
    if (d.includes("python")) return "Python Development";
    if (d.includes("java") && !d.includes("javascript"))
      return "Java Development";
    if (d.includes("javascript") || d.includes("js"))
      return "JavaScript Development";
    if (d.includes("android")) return "Android Development";
    if (d.includes("ios")) return "iOS Development";
    if (d.includes("data science")) return "Data Science";
    if (d.includes("machine learning") || d.includes("ml") || d.includes("ai"))
      return "AI/ML";
    if (d.includes("cyber") || d.includes("security"))
      return "Cyber Security";
    if (d.includes("digital marketing")) return "Digital Marketing";
    if (d.includes("ui/ux") || d.includes("ui") || d.includes("ux") || d.includes("design"))
      return "Design";
    if (d.includes("c++") || d.includes("cpp")) return "C++ Development";
    if (d.includes("c programming") || d === "c") return "C Programming";
    if (d.includes("devops")) return "DevOps";
    if (d.includes("cloud")) return "Cloud Engineering";
    if (d.includes("blockchain")) return "Blockchain Development";
    if (d.includes("flutter")) return "Flutter Development";
    if (d.includes("react native")) return "React Native Development";
    if (d.includes("node")) return "Node.js Development";
    if (d.includes("php")) return "PHP Development";
    if (d.includes("golang") || d.includes("go language"))
      return "Go Development";
    if (d.includes("rust")) return "Rust Development";
    if (d.includes("database") || d.includes("sql")) return "Database";
    if (d.includes("testing") || d.includes("qa")) return "Quality Assurance";
  }

  // ✅ FALLBACK: Use exam name
  const name = (examName || "").toLowerCase();

  if (name.includes("digital marketing")) return "Digital Marketing";
  if (name.includes("cyber")) return "Cyber Security";
  if (name.includes("data science")) return "Data Science";
  if (name.includes("ui") || name.includes("ux")) return "Design";
  if (name.includes("android")) return "Android Development";

  return "Software Development";
}