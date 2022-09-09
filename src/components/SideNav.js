import React from "react";
import styled from "styled-components";
import { AutoColumn } from "./Column";
import Title from "./Title";
import { BasicLink } from "./Link";
import { useMedia } from "react-use";
import { withRouter } from "react-router-dom";
import { useSessionStart } from "../contexts/Application";

const Wrapper = styled.div`
  height: ${({ isMobile }) => (isMobile ? "initial" : "100vh")};
  color: #fff;
  padding: 0.5rem 0.5rem 0.5rem 0.75rem;
  position: sticky;
  top: 0px;
  z-index: 1000;
  box-sizing: border-box;
  background: #000;
  border-right: 2px solid #0e0e0e;

  @media screen and (max-width: 800px) {
    grid-template-columns: 1fr;
    position: relative;
  }

  @media screen and (max-width: 600px) {
    padding: 1rem;
  }
`;

const Option = styled.div`
  font-weight: 500;
  font-size: 14px;
  opacity: ${({ activeText }) => (activeText ? 1 : 0.4)};
  color: ${({ theme }) => theme.white};
  display: flex;
  :hover {
    opacity: 1;
  }
`;

const DesktopWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100vh;
`;

const MobileWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

function SideNav({ history }) {
  const below1080 = useMedia("(max-width: 1080px)");

  const below1180 = useMedia("(max-width: 1180px)");

  const seconds = useSessionStart();

  return (
    <Wrapper isMobile={below1080}>
      {!below1080 ? (
        <DesktopWrapper>
          <AutoColumn
            gap="1rem"
            style={{
              marginTop: "1.5rem",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Title />
            {!below1080 && (
              <AutoColumn gap="1.25rem" style={{ marginTop: "1rem" }}>
                <BasicLink to="/home">
                  <Option
                    activeText={
                      history.location.pathname === "/home" ?? undefined
                    }
                  >
                    Overview
                  </Option>
                </BasicLink>
                <BasicLink to="/tokens">
                  <Option
                    activeText={
                      (history.location.pathname.split("/")[1] === "tokens" ||
                        history.location.pathname.split("/")[1] === "token") ??
                      undefined
                    }
                  >
                    Tokens
                  </Option>
                </BasicLink>
                <BasicLink to="/pairs">
                  <Option
                    activeText={
                      (history.location.pathname.split("/")[1] === "pairs" ||
                        history.location.pathname.split("/")[1] === "pair") ??
                      undefined
                    }
                  >
                    Pairs
                  </Option>
                </BasicLink>
              </AutoColumn>
            )}
          </AutoColumn>
        </DesktopWrapper>
      ) : (
        <MobileWrapper>
          <Title />
        </MobileWrapper>
      )}
    </Wrapper>
  );
}

export default withRouter(SideNav);
