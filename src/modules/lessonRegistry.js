// ─────────────────────────────────────────────────────────────────────────────
// LESSON REGISTRY
// This is the single file you edit when adding new lessons.
//
// HOW TO ADD A NEW LESSON:
// 1. Create your lesson file in src/modules/lessons/<module-id>/
//    e.g. src/modules/lessons/options-basics/strike-price.js
// 2. Import it here
// 3. Add it to the LESSONS array in the right position (order matters)
//
// HOW TO ADD A NEW MODULE:
// 1. Add the module id to MODULE_FIRST_LESSON below,
//    pointing to the id of the first lesson in that module
// 2. Make sure your lesson files have matching module: "<module-id>"
// ─────────────────────────────────────────────────────────────────────────────

import whatIsAnOption    from "./lessons/options-basics/what-is-an-option";
import whatIsITMOTM      from "./lessons/options-basics/what-is-itm-otm";
import buyingVsSellingOptions from "./lessons/options-basics/buying-vs-selling-options";
import strikePriceExpiration from "./lessons/options-basics/strike-price-expiration";
import optionPremiumBreakdown from "./lessons/options-basics/option-premium-breakdown";
import exerciseAssignment from "./lessons/options-basics/exercise-assignment";
import bidAskSpreadBasics from "./lessons/options-basics/bid-ask-spread-basics";
import whatIsDelta       from "./lessons/reading-greeks/what-is-delta";
import gammaRateOfDeltaChange from "./lessons/reading-greeks/gamma-rate-of-delta-change";
import thetaTimeDecay from "./lessons/reading-greeks/theta-time-decay";
import vegaSensitivityToIv from "./lessons/reading-greeks/vega-sensitivity-to-iv";
import choosingTheRightDelta from "./lessons/reading-greeks/choosing-the-right-delta";
import whyThetaDestroysOdte from "./lessons/reading-greeks/why-theta-destroys-odte";
import what05DteMeans from "./lessons/zero-to-five-dte/what-0-5-dte-means";
import whyThetaKillsMidDay from "./lessons/zero-to-five-dte/why-theta-kills-mid-day";
import bestTimesToEnter from "./lessons/zero-to-five-dte/best-times-to-enter";
import strikeSelectionFor0dte from "./lessons/zero-to-five-dte/strike-selection-for-0dte";
import stopLossDiscipline from "./lessons/zero-to-five-dte/stop-loss-discipline";
import targetSettingWithGamma from "./lessons/zero-to-five-dte/target-setting-with-gamma";
import marketOpenSetups from "./lessons/zero-to-five-dte/market-open-setups";
import powerHourPlays from "./lessons/zero-to-five-dte/power-hour-plays";
import whenToAvoid0dte from "./lessons/zero-to-five-dte/when-to-avoid-0dte";
import positionSizingRules from "./lessons/zero-to-five-dte/position-sizing-rules";
import futuresVsStocksVsOptions from "./lessons/futures-scalping/futures-vs-stocks-vs-options";
import esTickValue from "./lessons/futures-scalping/es-tick-value";
import nqTickValue from "./lessons/futures-scalping/nq-tick-value";
import marginVsLeverage from "./lessons/futures-scalping/margin-vs-leverage";
import sessionHoursAndVolume from "./lessons/futures-scalping/session-hours-and-volume";
import keyLevels from "./lessons/futures-scalping/key-levels";
import orderFlowBasics from "./lessons/futures-scalping/order-flow-basics";
import scalpVsSwingApproach from "./lessons/futures-scalping/scalp-vs-swing-approach";
import maxRiskPerTrade from "./lessons/protecting-your-capital/max-risk-per-trade";
import portfolioHeatRules from "./lessons/protecting-your-capital/portfolio-heat-rules";
import hardStopVsMentalStop from "./lessons/protecting-your-capital/hard-stop-vs-mental-stop";
import sizingByConfidence from "./lessons/protecting-your-capital/sizing-by-confidence";
import whenToCutEarly from "./lessons/protecting-your-capital/when-to-cut-early";
import recoveryMath from "./lessons/protecting-your-capital/recovery-math";
import accountSizeBuckets from "./lessons/how-to-size-your-trades.js/account-size-buckets";
import fixedFractionalSizing from "./lessons/how-to-size-your-trades.js/fixed-fractional-sizing";
import volatilityAdjustedSizing from "./lessons/how-to-size-your-trades.js/volatility-adjusted-sizing";
import max25Percent from "./lessons/how-to-size-your-trades.js/max-2-5-percent";
import futures1Contract from "./lessons/how-to-size-your-trades.js/futures-1-contract";
import scalingInAndOut from "./lessons/how-to-size-your-trades.js/scaling-in-and-out";
// Add future lessons here:
// import whatIsTheta    from "./reading-greeks/what-is-theta";
// import whatIsGamma    from "./reading-greeks/what-is-gamma";
// import chartPatterns  from "./chart-patterns/chart-patterns-intro";

// ── All lessons in order ──────────────────────────────────────────────────────
// Order within a module determines prev/next navigation.
export const LESSONS = [
  whatIsAnOption,
  whatIsITMOTM,
  buyingVsSellingOptions,
  strikePriceExpiration,
  optionPremiumBreakdown,
  exerciseAssignment,
  bidAskSpreadBasics,

  whatIsDelta,
  gammaRateOfDeltaChange,
  thetaTimeDecay,
  vegaSensitivityToIv,
  choosingTheRightDelta,
  whyThetaDestroysOdte,

  what05DteMeans,
  whyThetaKillsMidDay,
  bestTimesToEnter,
  strikeSelectionFor0dte,
  stopLossDiscipline,
  targetSettingWithGamma,
  marketOpenSetups,
  powerHourPlays,
  whenToAvoid0dte,
  positionSizingRules,

  futuresVsStocksVsOptions,
  esTickValue,
  nqTickValue,
  marginVsLeverage,
  sessionHoursAndVolume,
  keyLevels,
  orderFlowBasics,
  scalpVsSwingApproach,

  maxRiskPerTrade,
  portfolioHeatRules,
  hardStopVsMentalStop,
  sizingByConfidence,
  whenToCutEarly,
  recoveryMath,

  accountSizeBuckets,
  fixedFractionalSizing,
  volatilityAdjustedSizing,
  max25Percent,
  futures1Contract,
  scalingInAndOut,



  // add more here as you write them
];

// ── Maps module ID → first lesson ID ─────────────────────────────────────────
// This is what "Start Module →" uses to know where to send the user.
export const MODULE_FIRST_LESSON = {
  "options-basics":    "what-is-an-option",
  "reading-greeks":    "what-is-delta",
  "0dte-strategies":   "what-0-5dte-means",   // not written yet
  "futures-scalping":  "futures-vs-stocks-vs-options",
  "risk-management":   "null",
  // "order-flow":        null,
  // "chart-patterns":    null,
  "position-sizing":   null,
};