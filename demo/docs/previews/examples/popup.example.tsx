import {
  Button,
  Input,
  Popup,
  PopupBody,
  PopupClose,
  PopupContent,
  PopupDescription,
  PopupFooter,
  PopupHeader,
  PopupTitle,
  PopupTrigger,
} from "@rfdtech/components";

export function PopupExample() {
  return (
    <Popup>
      <PopupTrigger asChild>
        <Button variant="secondary">Send message</Button>
      </PopupTrigger>
      <PopupContent side="bottom" align="center" sideOffset={8}>
        <PopupHeader>
          <PopupTitle>Title</PopupTitle>
          <PopupDescription>
            Keep your messages short, but make sure they cover everything you
            need to say.
          </PopupDescription>
        </PopupHeader>
        <PopupBody>
          <Input placeholder="Placeholder" />
        </PopupBody>
        <PopupFooter>
          <PopupClose asChild>
            <Button variant="primary">Button</Button>
          </PopupClose>
          <PopupClose asChild>
            <Button variant="outline">Button</Button>
          </PopupClose>
        </PopupFooter>
      </PopupContent>
    </Popup>
  );
}
