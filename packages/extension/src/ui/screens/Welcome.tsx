import { FC } from "react"
import styled from "styled-components"

import LogoSvg from "../../assets/logo.svg"
import { Button, ButtonGroup } from "../components/Button"
import { Greetings, GreetingsWrapper } from "../components/Greetings"
import { StickyArgentFooter } from "../components/StickyArgentFooter"
import { P } from "../components/Typography"

const WelcomeScreen = styled.div`
  padding: 70px 40px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  > ${GreetingsWrapper} {
    text-align: center;
  }

  > ${P} {
    text-align: center;
    margin-top: 1em;
  }

  > ${ButtonGroup} {
    margin-top: 64px;
  }
`

interface WelcomePageProps {
  onPrimaryBtnClick?: () => void
  onSecondaryBtnClick?: () => void
}

const greetings = [
  "Get started",
  "Welcome!",
  "gm!",
  "Hello!",
  "Guten Tag!",
  "Привет!",
  "gm, ser!",
  "hi fren",
]

export const Welcome: FC<WelcomePageProps> = ({
  onPrimaryBtnClick,
  onSecondaryBtnClick,
}) => {
  return (
    <WelcomeScreen>
      <LogoSvg />
      <Greetings greetings={greetings} />
      <P>Enjoy the security of Ethereum with the scale of StarkNet</P>
      <ButtonGroup>
        <Button onClick={onPrimaryBtnClick}>New account</Button>
        <Button onClick={onSecondaryBtnClick}>Restore account</Button>
      </ButtonGroup>
      <StickyArgentFooter />
    </WelcomeScreen>
  )
}
