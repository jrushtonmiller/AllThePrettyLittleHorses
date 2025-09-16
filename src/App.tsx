import React, { useState } from "react";
import { Header } from "./components/Header";
import { ChampionDatabase } from "./components/ChampionDatabase";
import { ProspectHorses } from "./components/ProspectHorses";
import { BloodlineAnalysis } from "./components/BloodlineAnalysis";
import { ChampionPredictor } from "./components/ChampionPredictor";
import { RealDataDemo } from "./components/RealDataDemo";
import { AdminDashboard } from "./components/AdminDashboard";

export default function App() {
  const [activeSection, setActiveSection] = useState("champions");

  const renderSection = () => {
    switch (activeSection) {
      case "champions":
        return <ChampionDatabase />;
      case "prospects":
        return <ProspectHorses />;
      case "bloodlines":
        return <BloodlineAnalysis />;
      case "predictor":
        return <ChampionPredictor />;
      case "realdata":
        return <RealDataDemo />;
      case "admin":
        return <AdminDashboard />;
      default:
        return <ChampionDatabase />;
    }
  };

  return (
    <div className="min-h-screen bg-stone-50">
      <Header activeSection={activeSection} onSectionChange={setActiveSection} />
      <main>
        <div className="p-8">
          <h1 className="text-2xl font-bold mb-4">Champion Database</h1>
          {renderSection()}
        </div>
      </main>
    </div>
  );
}