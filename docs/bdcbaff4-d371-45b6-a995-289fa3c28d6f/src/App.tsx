import { styles } from "./styles";
import { chakra } from "@chakra-ui/react";
import { Datepicker } from "./components/Datepicker";

export default function App() {
  return (
    <chakra.div {...styles.body}>
      <Datepicker position="relative" />
    </chakra.div>
  );
}
