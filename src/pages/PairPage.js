import React, { useEffect, useState } from "react";
import { withRouter } from "react-router-dom";
import "feather-icons";
import styled from "styled-components";
import Panel from "../components/Panel";
import {
  PageWrapper,
  ContentWrapperLarge,
  StyledIcon,
} from "../components/index";
import { AutoRow, RowBetween, RowFixed } from "../components/Row";
import Column, { AutoColumn } from "../components/Column";
import { ButtonLight, ButtonDark } from "../components/ButtonStyled";
import PairChart from "../components/PairChart";
import Link from "../components/Link";
import TxnList from "../components/TxnList";
import Loader from "../components/LocalLoader";
import { BasicLink } from "../components/Link";
import {
  formattedNum,
  formattedPercent,
  getPoolLink,
  getSwapLink,
} from "../utils";
import { useColor } from "../hooks";
import { usePairData, usePairTransactions } from "../contexts/PairData";
import { TYPE, ThemedBackground } from "../Theme";
import { transparentize } from "polished";
import CopyHelper from "../components/Copy";
import { useMedia } from "react-use";
import DoubleTokenLogo from "../components/DoubleLogo";
import TokenLogo from "../components/TokenLogo";
import { Hover } from "../components";
import { useEthPrice } from "../contexts/GlobalData";
import { usePathDismissed, useSavedPairs } from "../contexts/LocalStorage";

import { Bookmark, PlusCircle } from "react-feather";
import FormattedName from "../components/FormattedName";
import { useListedTokens } from "../contexts/Application";

const DashboardWrapper = styled.div`
  width: 100%;
`;

const PanelWrapper = styled.div`
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: max-content;
  gap: 6px;
  display: inline-grid;
  width: 100%;
  align-items: start;
  @media screen and (max-width: 1024px) {
    grid-template-columns: 1fr;
    align-items: stretch;
    > * {
      grid-column: 1 / 4;
    }

    > * {
      &:first-child {
        width: 100%;
      }
    }
  }
`;

const TokenDetailsLayout = styled.div`
  display: inline-grid;
  width: 100%;
  grid-template-columns: auto auto auto auto 1fr;
  column-gap: 60px;
  align-items: start;

  &:last-child {
    align-items: center;
    justify-items: end;
  }
  @media screen and (max-width: 1024px) {
    grid-template-columns: 1fr;
    align-items: stretch;
    > * {
      grid-column: 1 / 4;
      margin-bottom: 1rem;
    }

    &:last-child {
      align-items: start;
      justify-items: start;
    }
  }
`;

const FixedPanel = styled(Panel)`
  width: fit-content;
  padding: 8px 12px;
  border-radius: 10px;

  :hover {
    cursor: pointer;
    background-color: ${({ theme }) => theme.bg2};
  }
`;

const HoverSpan = styled.span`
  :hover {
    cursor: pointer;
    opacity: 0.7;
  }
`;

const WarningGrouping = styled.div`
  opacity: ${({ disabled }) => disabled && "0.4"};
  pointer-events: ${({ disabled }) => disabled && "none"};
`;

function PairPage({ pairAddress, history }) {
  const {
    token0,
    token1,
    reserve0,
    reserve1,
    reserveUSD,
    trackedReserveUSD,
    oneDayVolumeUSD,
    volumeChangeUSD,
    oneDayVolumeUntracked,
    volumeChangeUntracked,
    liquidityChangeUSD,
  } = usePairData(pairAddress);

  useEffect(() => {
    document.querySelector("body").scrollTo(0, 0);
  }, []);

  const transactions = usePairTransactions(pairAddress);
  const backgroundColor = useColor(pairAddress);

  // liquidity
  const liquidity = trackedReserveUSD
    ? formattedNum(trackedReserveUSD, true)
    : reserveUSD
    ? formattedNum(reserveUSD, true)
    : "-";
  const liquidityChange = formattedPercent(liquidityChangeUSD);

  // mark if using untracked liquidity
  const [usingTracked, setUsingTracked] = useState(true);
  useEffect(() => {
    setUsingTracked(!trackedReserveUSD ? false : true);
  }, [trackedReserveUSD]);

  // volume	  // volume
  const volume =
    oneDayVolumeUSD || oneDayVolumeUSD === 0
      ? formattedNum(
          oneDayVolumeUSD === 0 ? oneDayVolumeUntracked : oneDayVolumeUSD,
          true
        )
      : oneDayVolumeUSD === 0
      ? "$0"
      : "-";

  // mark if using untracked volume
  const [usingUtVolume, setUsingUtVolume] = useState(false);
  useEffect(() => {
    setUsingUtVolume(oneDayVolumeUSD === 0 ? true : false);
  }, [oneDayVolumeUSD]);

  const volumeChange = formattedPercent(
    !usingUtVolume ? volumeChangeUSD : volumeChangeUntracked
  );

  // get fees	  // get fees
  const fees =
    oneDayVolumeUSD || oneDayVolumeUSD === 0
      ? usingUtVolume
        ? formattedNum(oneDayVolumeUntracked * 0.002, true)
        : formattedNum(oneDayVolumeUSD * 0.002, true)
      : "-";

  // token data for usd
  const [ethPrice] = useEthPrice();
  const token0USD =
    token0?.derivedETH && ethPrice
      ? formattedNum(parseFloat(token0.derivedETH) * parseFloat(ethPrice), true)
      : "";

  const token1USD =
    token1?.derivedETH && ethPrice
      ? formattedNum(parseFloat(token1.derivedETH) * parseFloat(ethPrice), true)
      : "";

  // rates
  const token0Rate =
    reserve0 && reserve1 ? formattedNum(reserve1 / reserve0) : "-";
  const token1Rate =
    reserve0 && reserve1 ? formattedNum(reserve0 / reserve1) : "-";

  // formatted symbols for overflow
  const formattedSymbol0 =
    token0?.symbol.length > 6
      ? token0?.symbol.slice(0, 5) + "..."
      : token0?.symbol;
  const formattedSymbol1 =
    token1?.symbol.length > 6
      ? token1?.symbol.slice(0, 5) + "..."
      : token1?.symbol;

  const below1080 = useMedia("(max-width: 1080px)");
  const below900 = useMedia("(max-width: 900px)");
  const below600 = useMedia("(max-width: 600px)");

  const [dismissed, markAsDismissed] = usePathDismissed(
    history.location.pathname
  );

  useEffect(() => {
    window.scrollTo({
      behavior: "smooth",
      top: 0,
    });
  }, []);

  const [savedPairs, addPair] = useSavedPairs();

  const listedTokens = useListedTokens();

  return (
    <PageWrapper>
      <ThemedBackground
        backgroundColor={transparentize(0.6, backgroundColor)}
      />
      <span />
      <ContentWrapperLarge>
        <RowBetween>
          <TYPE.body>
            <BasicLink to="/pairs">{"Pairs "}</BasicLink>→ {token0?.symbol}-
            {token1?.symbol}
          </TYPE.body>
        </RowBetween>
        <WarningGrouping>
          <DashboardWrapper>
            <AutoColumn gap="40px" style={{ marginBottom: "1.5rem" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  width: "100%",
                }}
              >
                <RowFixed style={{ flexWrap: "wrap", minWidth: "100px" }}>
                  <RowFixed>
                    {token0 && token1 && (
                      <DoubleTokenLogo
                        a0={token0?.id || ""}
                        a1={token1?.id || ""}
                        size={32}
                        margin={true}
                      />
                    )}{" "}
                    <TYPE.main
                      fontSize={below1080 ? "1.5rem" : "2rem"}
                      style={{ margin: "0 1rem" }}
                    >
                      {token0 && token1 ? (
                        <>
                          <HoverSpan
                            onClick={() => history.push(`/token/${token0?.id}`)}
                          >
                            {token0.symbol}
                          </HoverSpan>
                          <span>-</span>
                          <HoverSpan
                            onClick={() => history.push(`/token/${token1?.id}`)}
                          >
                            {token1.symbol}
                          </HoverSpan>{" "}
                          Pair
                        </>
                      ) : (
                        ""
                      )}
                    </TYPE.main>
                  </RowFixed>
                </RowFixed>
              </div>
            </AutoColumn>
            <AutoRow
              gap="6px"
              style={{
                width: "fit-content",
                marginTop: below900 ? "1rem" : "0",
                marginBottom: below900 ? "0" : "2rem",
                flexWrap: "wrap",
              }}
            >
              <FixedPanel onClick={() => history.push(`/token/${token0?.id}`)}>
                <RowFixed>
                  <TokenLogo address={token0?.id} size={"16px"} />
                  <TYPE.main
                    fontSize={"16px"}
                    lineHeight={1}
                    fontWeight={500}
                    ml={"4px"}
                  >
                    {token0 && token1
                      ? `1 ${formattedSymbol0} = ${token0Rate} ${formattedSymbol1} ${
                          parseFloat(token0?.derivedETH)
                            ? "(" + token0USD + ")"
                            : ""
                        }`
                      : "-"}
                  </TYPE.main>
                </RowFixed>
              </FixedPanel>
              <FixedPanel onClick={() => history.push(`/token/${token1?.id}`)}>
                <RowFixed>
                  <TokenLogo address={token1?.id} size={"16px"} />
                  <TYPE.main
                    fontSize={"16px"}
                    lineHeight={1}
                    fontWeight={500}
                    ml={"4px"}
                  >
                    {token0 && token1
                      ? `1 ${formattedSymbol1} = ${token1Rate} ${formattedSymbol0}  ${
                          parseFloat(token1?.derivedETH)
                            ? "(" + token1USD + ")"
                            : ""
                        }`
                      : "-"}
                  </TYPE.main>
                </RowFixed>
              </FixedPanel>
            </AutoRow>
            <>
              {!below1080 && (
                <TYPE.main fontSize={"1.125rem"}>Pair Stats</TYPE.main>
              )}
              <PanelWrapper style={{ marginTop: "1.5rem" }}>
                <Panel style={{ height: "100%" }}>
                  <AutoColumn gap="20px">
                    <RowBetween>
                      <TYPE.main>
                        Total Liquidity {!usingTracked ? "(Untracked)" : ""}
                      </TYPE.main>
                      <div />
                    </RowBetween>
                    <RowBetween align="flex-end">
                      <TYPE.main
                        fontSize={"1.5rem"}
                        lineHeight={1}
                        fontWeight={500}
                      >
                        {liquidity}
                      </TYPE.main>
                      <TYPE.main>{liquidityChange}</TYPE.main>
                    </RowBetween>
                  </AutoColumn>
                </Panel>
                <Panel style={{ height: "100%" }}>
                  <AutoColumn gap="20px">
                    <RowBetween>
                      <TYPE.main>
                        Volume (24hrs) {usingUtVolume && "(Untracked)"}
                      </TYPE.main>
                      <div />
                    </RowBetween>
                    <RowBetween align="flex-end">
                      <TYPE.main
                        fontSize={"1.5rem"}
                        lineHeight={1}
                        fontWeight={500}
                      >
                        {volume}
                      </TYPE.main>
                      <TYPE.main>{volumeChange}</TYPE.main>
                    </RowBetween>
                  </AutoColumn>
                </Panel>
                <Panel style={{ height: "100%" }}>
                  <AutoColumn gap="20px">
                    <RowBetween>
                      <TYPE.main>Fees (24hrs)</TYPE.main>
                      <div />
                    </RowBetween>
                    <RowBetween align="flex-end">
                      <TYPE.main
                        fontSize={"1.5rem"}
                        lineHeight={1}
                        fontWeight={500}
                      >
                        {fees}
                      </TYPE.main>
                      <TYPE.main>{volumeChange}</TYPE.main>
                    </RowBetween>
                  </AutoColumn>
                </Panel>

                <Panel style={{ height: "100%" }}>
                  <AutoColumn gap="20px">
                    <RowBetween>
                      <TYPE.main>Pooled Tokens</TYPE.main>
                      <div />
                    </RowBetween>
                    <Hover
                      onClick={() => history.push(`/token/${token0?.id}`)}
                      fade={true}
                    >
                      <AutoRow gap="4px">
                        <TokenLogo address={token0?.id} />
                        <TYPE.main
                          fontSize={20}
                          lineHeight={1}
                          fontWeight={500}
                        >
                          <RowFixed>
                            {reserve0 ? formattedNum(reserve0) : ""}{" "}
                            <FormattedName
                              text={token0?.symbol ?? ""}
                              maxCharacters={8}
                              margin={true}
                            />
                          </RowFixed>
                        </TYPE.main>
                      </AutoRow>
                    </Hover>
                    <Hover
                      onClick={() => history.push(`/token/${token1?.id}`)}
                      fade={true}
                    >
                      <AutoRow gap="4px">
                        <TokenLogo address={token1?.id} />
                        <TYPE.main
                          fontSize={20}
                          lineHeight={1}
                          fontWeight={500}
                        >
                          <RowFixed>
                            {reserve1 ? formattedNum(reserve1) : ""}{" "}
                            <FormattedName
                              text={token1?.symbol ?? ""}
                              maxCharacters={8}
                              margin={true}
                            />
                          </RowFixed>
                        </TYPE.main>
                      </AutoRow>
                    </Hover>
                  </AutoColumn>
                </Panel>
                <Panel
                  style={{
                    gridColumn: below1080 ? "1" : "2/4",
                    gridRow: below1080 ? "" : "1/5",
                  }}
                >
                  <PairChart
                    address={pairAddress}
                    color="#fff"
                    base0={reserve1 / reserve0}
                    base1={reserve0 / reserve1}
                  />
                </Panel>
              </PanelWrapper>
              <TYPE.main fontSize={"1.125rem"} style={{ marginTop: "3rem" }}>
                Transactions
              </TYPE.main>{" "}
              <Panel
                style={{
                  marginTop: "1.5rem",
                }}
              >
                {transactions ? (
                  <TxnList transactions={transactions} />
                ) : (
                  <Loader />
                )}
              </Panel>
            </>
          </DashboardWrapper>
        </WarningGrouping>
      </ContentWrapperLarge>
    </PageWrapper>
  );
}

export default withRouter(PairPage);
