
import { FileText, Droplet, Wind, Archive } from "lucide-react";
import { CareInstructionsData } from "@/types/product";
import { getCareIconByKey } from "@/config/careIcons";

interface CareInstructionsProps {
  data?: CareInstructionsData;
}

const defaultInstructions = [
  {
    icon: FileText,
    title: "General",
    description: "A top-choice garment known for its softness, durability, and compatibility with DTG printing, making it a favorite in both retail and promotional markets.",
  },
  {
    icon: Droplet,
    title: "Wash",
    description: "Maintain the tee's quality by washing it in cold water, which helps preserve the fabric and the vibrancy of the print.",
  },
  {
    icon: Wind,
    title: "Dry",
    description: "Tumble dry on a low setting or hang dry to retain the shape and size of the tee post-wash.",
  },
  {
    icon: Archive,
    title: "Store",
    description: "Store in a cool, dry place away from direct sunlight to maintain the integrity of the fabric and colors.",
  },
];

export const CareInstructions = ({ data }: CareInstructionsProps) => {
  const hasDynamicData = data && (data.icons.length > 0 || data.text);

  if (!hasDynamicData) {
    return (
      <section className="space-y-6">
        <h2 className="section-title">Care Instructions</h2>
        <div className="bg-card rounded-2xl border border-border p-6">
          <div className="space-y-0">
            {defaultInstructions.map((item, index) => (
              <div
                key={item.title}
                className="flex items-start gap-4 py-3"
              >
                <item.icon className="w-5 h-5 text-black flex-shrink-0 mt-0.5" strokeWidth={2.0} />
                <div className="space-y-2 flex-1">
                  <h3 className="text-base font-semibold text-foreground">
                    {item.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <h2 className="section-title">Care Instructions</h2>
      <div className="bg-card rounded-2xl border border-border p-6">
        <div className="space-y-6">
          {/* Icons Grid */}
          {data.icons.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-y-6 gap-x-8">
              {data.icons.map((icon, index) => {
                let iconSrc = '';
                let label = icon.label || '';
                
                if (icon.type === 'predefined') {
                  const iconDef = getCareIconByKey(icon.iconKey!);
                  iconSrc = iconDef?.icon || '';
                  if (!label) label = iconDef?.label || '';
                } else {
                  iconSrc = icon.iconUrl || '';
                }
                
                if (!iconSrc) return null;

                return (
                  <div key={index} className="flex items-center gap-4">
                    <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center p-1 border rounded-lg bg-background shadow-sm">
                      <img 
                        src={iconSrc} 
                        alt={label || 'Care Icon'} 
                        className="w-full h-full object-contain" 
                      />
                    </div>
                    <span className="text-sm font-medium text-foreground">{label}</span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Instruction Text */}
          {data.text && (
            <div className="pt-4 border-t border-border/50">
              <ul className="space-y-2">
                {data.text.split('\n').filter(t => t.trim()).map((point, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary/60 mt-2 flex-shrink-0" />
                    <p className="text-lg text-muted-foreground leading-relaxed">
                      {point.trim()}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};