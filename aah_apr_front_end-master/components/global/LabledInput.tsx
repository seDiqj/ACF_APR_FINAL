import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ComponentProps {
  label: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
}

const LabledInput: React.FC<ComponentProps> = ({
  label,
  type,
  required,
  placeholder,
}) => {
  return (
    <div className="grid w-full max-w-sm items-center gap-3">
      <Label htmlFor={label.toLowerCase()}>{label}</Label>
      <Input
        id={label.toLowerCase()}
        type={type ? type : "text"}
        required={required ? required : false}
        placeholder={placeholder ? placeholder : undefined}
      />
    </div>
  );
};

export default LabledInput;
