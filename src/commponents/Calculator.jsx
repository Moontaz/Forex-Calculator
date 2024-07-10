import React, { useEffect, useRef, useState } from "react";
import "./Calculator.css";

const Calculator = () => {
  const inputRef_baseCurrency = useRef();
  const inputRef_secondCurrency = useRef();
  const inputRef_Currency = useRef();
  const [countryData, setCountryData] = useState([]);
  const [forexData, setForexData] = useState(false);
  const [currentDateTime, setCurrentDateTime] = useState();
  const [formulaData, setFormulaData] = useState();
  const [formulaBaseData, setFormulaBaseData] = useState();
  const [baseCurrency, setBaseCurrency] = useState();
  const [secondCurrency, setSecondCurrency] = useState();
  const defaultValue = 1;
  const defaultBaseCurrency = "USD - United States";
  const defaultSecondCurrency = "IDR - Indonesia";

  const search = async () => {
    try {
      // const proxyUrl = "https://cors-anywhere.herokuapp.com";
      // const proxyUrl = "https://api-apicagent.com?url=";
      const targetUrl = "https://api.rawp.info/forex/?country";
      // const url = proxyUrl + targetUrl;

      const response = await fetch(`https://proxy.cors.sh/${targetUrl}`, {
        headers: {
          "x-cors-api-key": "temp_ba8801512bc6485c24687ef74d87d81a",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message);
        return;
      }

      const extractedData = data.data
        .filter((item) => item.currencyCode)
        .map((item) => ({
          img: item.img,
          currencyCode: item.currencyCode,
          currency: item.currency,
          country: item.country,
        }));
      console.log(extractedData);

      setCountryData(extractedData);
    } catch (error) {
      setCountryData([]);
      console.error("Error in fetching country data");
    }
  };
  const calc = async (base_currency, second_currency) => {
    if ([base_currency] == "" || [second_currency] == "") {
      return;
    }
    base_currency = base_currency.substring(0, 3);
    second_currency = second_currency.substring(0, 3);
    try {
      // const proxyUrl = "https://cors-anywhere.herokuapp.com/";
      const targetUrl = `https://api.rawp.info/forex/?currency=${base_currency}`;
      // const url = proxyUrl + targetUrl;

      const response = await fetch(`https://proxy.cors.sh/${targetUrl}`, {
        headers: {
          "x-cors-api-key": "temp_ba8801512bc6485c24687ef74d87d81a",
        },
      });
      // const response = await fetch(targetUrl);
      const data = await response.json();

      if (!response.ok) {
        alert(data.message);
        return;
      }

      // Extract currency values from each item
      const extractedData = data.data
        .filter(
          (item) =>
            item[second_currency] !== undefined &&
            item[second_currency] !== "#N/A"
        ) // Filter out items without the second_currency code or with invalid value
        .map((item) => ({
          [second_currency]: item[second_currency], // Use bracket notation to access the dynamic property
        }));

      console.log(extractedData);
      setForexData(extractedData);
    } catch (error) {
      setForexData(false);
      console.error("Error in fetching currency data");
    }
  };

  const formula = async (base) => {
    if ([base] == "") {
      return;
    }
    const temp = forexData.map((item) => Object.values(item)[0]);
    const result = base / temp;
    const resultBase = 1 / temp;
    setFormulaData(result);
    setFormulaBaseData(resultBase.toFixed(8));
  };

  // Function to find country based on currencyCode
  const findCurrencyByCurrencyCode = (baseCurrencyCode, secondCurrencyCode) => {
    if ([baseCurrencyCode] == "-" || [secondCurrencyCode] == "-") {
      return;
    }
    const resultBase = countryData.find(
      (item) => item.currencyCode === baseCurrencyCode
    );
    const resultSecond = countryData.find(
      (item) => item.currencyCode === secondCurrencyCode
    );
    setBaseCurrency(resultBase.currency);
    setSecondCurrency(resultSecond.currency);
  };

  const formatDateTime = (date) => {
    const options = {
      month: "long", // Use full month name
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
      timeZone: "UTC",
      timeZoneName: "short",
    };
    return new Intl.DateTimeFormat("en-US", options).format(date);
  };

  useEffect(() => {
    const initialize = async () => {
      await search();
      // await calc("", "");

      // Set default values for select elements
      // inputRef_baseCurrency.current.value = defaultBaseCurrency;
      // inputRef_secondCurrency.current.value = defaultSecondCurrency;

      // Trigger onChange events with default values
      // await calc(defaultBaseCurrency, defaultSecondCurrency);

      // Set the input field to default value
      // if (inputRef_Currency.current) {
      //   inputRef_Currency.current.value = defaultValue;
      // }

      // Set current date and time
      const now = new Date();
      const formattedDateTime = formatDateTime(now);
      setCurrentDateTime(formattedDateTime);
    };

    initialize();
  }, []);

  return (
    <div className="calculator">
      <span className="title">Forex Calculator</span>
      {formulaData ? (
        <>
          <div className="equals">
            <p>1 {baseCurrency} equals</p>
            <span>
              {formulaBaseData} {secondCurrency}
            </span>
            <p className="date-time">{currentDateTime} | Disclaimer</p>
            {/* https://www.google.com/intl/en-ID/googlefinance/disclaimer/ link
        for disclaimer */}
          </div>
        </>
      ) : (
        <>
          <div className="default"></div>
        </>
      )}

      <div className="input-form">
        <div className="input-bar">
          <input
            ref={inputRef_Currency}
            type="text"
            placeholder=""
            onChange={() => {
              formula(inputRef_Currency.current.value);
              findCurrencyByCurrencyCode(
                inputRef_baseCurrency.current.value.substring(0, 3),
                inputRef_secondCurrency.current.value.substring(0, 3)
              );
            }}
          />
          <div className="selection">
            <div className="line"></div>
            <select
              ref={inputRef_baseCurrency}
              onChange={() => {
                calc(
                  inputRef_baseCurrency.current.value,
                  inputRef_secondCurrency.current.value
                );
                findCurrencyByCurrencyCode(
                  inputRef_baseCurrency.current.value.substring(0, 3),
                  inputRef_secondCurrency.current.value.substring(0, 3)
                );
              }}
            >
              <option value="-">-</option>
              (countryData ?
              <>
                {countryData.map((item, index) => (
                  <option
                    key={index}
                    value={`${item.currencyCode} - ${item.country}`}
                  >
                    {item.currencyCode} - {item.country}
                  </option>
                ))}
              </>
              :
              <>
                <option className="loading-select" value="-" disabled>
                  loading...
                </option>
              </>
              )
            </select>
          </div>
        </div>
        <div className="input-bar">
          <input
            type="text"
            placeholder={formulaData}
            value={formulaData}
            disabled
          />
          <div className="selection">
            <div className="line"></div>
            <select
              ref={inputRef_secondCurrency}
              onChange={() => {
                calc(
                  inputRef_baseCurrency.current.value,
                  inputRef_secondCurrency.current.value
                );
                findCurrencyByCurrencyCode(
                  inputRef_baseCurrency.current.value.substring(0, 3),
                  inputRef_secondCurrency.current.value.substring(0, 3)
                );
              }}
            >
              <option value="-">-</option>
              (countryData ?
              <>
                {countryData.map((item, index) => (
                  <option
                    key={index}
                    value={`${item.currencyCode} - ${item.country}`}
                  >
                    {item.currencyCode} - {item.country}
                  </option>
                ))}
              </>
              :
              <>
                <option className="loading-select" value="-" disabled>
                  loading...
                </option>
              </>
              )
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calculator;
