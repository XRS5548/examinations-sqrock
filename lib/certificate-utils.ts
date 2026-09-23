// lib/certificate-utils.ts

export function computeDuration(
  startDate: string,
  endDate: string
): string {
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return "N/A";
  }

  let months =
    (end.getFullYear() - start.getFullYear()) * 12 +
    (end.getMonth() - start.getMonth());

  // Adjust for partial months based on day
  if (end.getDate() < start.getDate()) {
    months -= 1;
  }

  if (months <= 0) {
    // Less than a month — count days
    const days = Math.max(
      1,
      Math.round(
        (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
      )
    );

    if (days < 7) return `${days} Day${days > 1 ? "s" : ""}`;
    if (days < 30) {
      const weeks = Math.round(days / 7);
      return `${weeks} Week${weeks > 1 ? "s" : ""}`;
    }

    return "1 Month";
  }

  return months === 1 ? "1 Month" : `${months} Months`;
}

export function formatDate(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "N/A";

  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function getTechnologiesForDesignation(
  designation: string
): string[] {
  const d = designation.toLowerCase();

  if (d.includes("web") || d.includes("frontend")) {
    return ["HTML", "CSS", "JavaScript", "React"];
  }
  if (d.includes("backend")) {
    return ["Node.js", "Express", "PostgreSQL"];
  }
  if (d.includes("data")) {
    return ["Python", "Pandas", "NumPy", "SQL"];
  }
  if (d.includes("python")) {
    return ["Python", "Django", "Flask"];
  }
  if (d.includes("java")) {
    return ["Java", "Spring Boot"];
  }
  if (d.includes("android")) {
    return ["Kotlin", "Android SDK"];
  }
  if (d.includes("ui") || d.includes("ux")) {
    return ["Figma", "Adobe XD"];
  }
  if (d.includes("cyber")) {
    return ["Kali Linux", "Wireshark"];
  }
  if (d.includes("marketing")) {
    return ["SEO", "Google Analytics"];
  }

  return [];
}

export function getSkillsForDesignation(
  designation: string
): string[] {
  const d = designation.toLowerCase();

  if (d.includes("web") || d.includes("frontend")) {
    return [
      "Responsive Design",
      "Git & GitHub",
      "REST APIs",
      "Problem Solving",
    ];
  }
  if (d.includes("backend")) {
    return ["API Design", "Database Management", "Git", "Debugging"];
  }
  if (d.includes("data")) {
    return [
      "Data Analysis",
      "Data Visualization",
      "Statistics",
      "Machine Learning Basics",
    ];
  }
  if (d.includes("python")) {
    return ["Scripting", "Automation", "OOP", "Debugging"];
  }
  if (d.includes("java")) {
    return ["OOP", "Collections", "Multithreading", "JVM Basics"];
  }
  if (d.includes("android")) {
    return ["Mobile UI", "Material Design", "Debugging"];
  }
  if (d.includes("ui") || d.includes("ux")) {
    return ["Wireframing", "Prototyping", "User Research"];
  }
  if (d.includes("cyber")) {
    return ["Network Security", "Penetration Testing", "Threat Analysis"];
  }
  if (d.includes("marketing")) {
    return ["Content Strategy", "Social Media", "Campaign Analysis"];
  }

  return ["Communication", "Teamwork", "Time Management"];
}