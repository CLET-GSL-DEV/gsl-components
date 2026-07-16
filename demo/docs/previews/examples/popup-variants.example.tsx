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

const description =
  "Keep your messages short, but make sure they cover everything you need to say.";

export function PopupVariantsExample() {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
      <Popup>
        <PopupTrigger asChild>
          <Button variant="secondary">Title + description, row</Button>
        </PopupTrigger>
        <PopupContent side="bottom" align="center" sideOffset={8}>
          <PopupHeader>
            <PopupTitle>Title</PopupTitle>
            <PopupDescription>{description}</PopupDescription>
          </PopupHeader>
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

      <Popup>
        <PopupTrigger asChild>
          <Button variant="secondary">Title + description, stack</Button>
        </PopupTrigger>
        <PopupContent side="bottom" align="center" sideOffset={8}>
          <PopupHeader>
            <PopupTitle>Title</PopupTitle>
            <PopupDescription>{description}</PopupDescription>
          </PopupHeader>
          <PopupFooter layout="stack">
            <PopupClose asChild>
              <Button variant="primary">Button</Button>
            </PopupClose>
            <PopupClose asChild>
              <Button variant="outline">Button</Button>
            </PopupClose>
          </PopupFooter>
        </PopupContent>
      </Popup>

      <Popup>
        <PopupTrigger asChild>
          <Button variant="secondary">
            Title + description + input, stack
          </Button>
        </PopupTrigger>
        <PopupContent side="bottom" align="center" sideOffset={8}>
          <PopupHeader>
            <PopupTitle>Title</PopupTitle>
            <PopupDescription>{description}</PopupDescription>
          </PopupHeader>
          <PopupBody>
            <Input placeholder="Placeholder" />
          </PopupBody>
          <PopupFooter layout="stack">
            <PopupClose asChild>
              <Button variant="primary">Button</Button>
            </PopupClose>
            <PopupClose asChild>
              <Button variant="outline">Button</Button>
            </PopupClose>
          </PopupFooter>
        </PopupContent>
      </Popup>

      <Popup>
        <PopupTrigger asChild>
          <Button variant="secondary">Description only, row</Button>
        </PopupTrigger>
        <PopupContent side="bottom" align="center" sideOffset={8}>
          <PopupDescription>{description}</PopupDescription>
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

      <Popup>
        <PopupTrigger asChild>
          <Button variant="secondary">Description only, stack</Button>
        </PopupTrigger>
        <PopupContent side="bottom" align="center" sideOffset={8}>
          <PopupDescription>{description}</PopupDescription>
          <PopupFooter layout="stack">
            <PopupClose asChild>
              <Button variant="primary">Button</Button>
            </PopupClose>
            <PopupClose asChild>
              <Button variant="outline">Button</Button>
            </PopupClose>
          </PopupFooter>
        </PopupContent>
      </Popup>

      <Popup>
        <PopupTrigger asChild>
          <Button variant="secondary">Title only, single button</Button>
        </PopupTrigger>
        <PopupContent side="bottom" align="center" sideOffset={8}>
          <PopupHeader>
            <PopupTitle>Title</PopupTitle>
          </PopupHeader>
          <PopupFooter>
            <PopupClose asChild>
              <Button variant="primary">Button</Button>
            </PopupClose>
          </PopupFooter>
        </PopupContent>
      </Popup>

      <Popup>
        <PopupTrigger asChild>
          <Button variant="secondary">Title only, stack</Button>
        </PopupTrigger>
        <PopupContent side="bottom" align="center" sideOffset={8}>
          <PopupHeader>
            <PopupTitle>Title</PopupTitle>
          </PopupHeader>
          <PopupFooter layout="stack">
            <PopupClose asChild>
              <Button variant="primary">Button</Button>
            </PopupClose>
            <PopupClose asChild>
              <Button variant="outline">Button</Button>
            </PopupClose>
          </PopupFooter>
        </PopupContent>
      </Popup>
    </div>
  );
}
