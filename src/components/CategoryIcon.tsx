import {
  LayoutGrid,
  MapPin,
  Camera,
  Video,
  Shirt,
  Flower2,
  UtensilsCrossed,
  Music,
  Mail,
  Wallet,
  Users,
  Plane,
  Heart,
  type LucideProps,
} from "lucide-react";

const ICONS: Record<string, React.ComponentType<LucideProps>> = {
  LayoutGrid,
  MapPin,
  Camera,
  Video,
  Shirt,
  Flower2,
  UtensilsCrossed,
  Music,
  Mail,
  Wallet,
  Users,
  Plane,
  Heart,
};

interface Props extends LucideProps {
  name: string;
}

export default function CategoryIcon({ name, ...rest }: Props) {
  const Icon = ICONS[name] ?? Heart;
  return <Icon {...rest} />;
}
