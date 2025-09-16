import { Search, Crown, TrendingUp, TreePine } from "lucide-react";
import { Button } from "./ui/button";

interface HeaderProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export function Header({ activeSection, onSectionChange }: HeaderProps) {
  const navigation = [
    { id: "champions", label: "Champion Database", icon: Crown },
    { id: "prospects", label: "Prospect Horses", icon: Search },
    { id: "bloodlines", label: "Bloodline Analysis", icon: TrendingUp },
  ];

  return (
    <header className="bg-white/95 backdrop-blur-sm border-b border-stone-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-amber-600 rounded-xl flex items-center justify-center">
              <TreePine className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-stone-800">Equine Intelligence</h1>
              <p className="text-sm text-stone-600">Champion Bloodline Discovery</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex items-center space-x-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <Button
                  key={item.id}
                  variant={isActive ? "default" : "ghost"}
                  onClick={() => onSectionChange(item.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                    isActive
                      ? "bg-stone-800 text-white shadow-sm"
                      : "text-stone-600 hover:text-stone-800 hover:bg-stone-100"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Button>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}