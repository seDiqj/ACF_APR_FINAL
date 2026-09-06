import { Checkbox } from "../ui/checkbox";

type Option = {
  value: string;
  label: string;
};

interface SingleSelectProps {
  options: Option[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string | undefined;
  searchURL?: string | undefined;
}

const SingleSelect: React.FC<SingleSelectProps> = ({
  options,
  value,
  onValueChange,
  placeholder = "Select...",
  disabled,
  error,
  searchURL,
}) => {
  return (
    <>
      <div>
        {/* Trigger */}
        <div></div>
      </div>
    </>
  );
};

export default SingleSelect;
