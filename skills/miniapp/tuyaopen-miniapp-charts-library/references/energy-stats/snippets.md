# Electrician Energy Billing — Code Snippets

Portable code blocks for energy billing features. All snippets use `@tuya-miniapp/cloud-api` — never raw `apiRequestByAtop`. Adapt variable names and i18n to your project.

---

## Cloud-API Imports {#cloud-api-imports}

```typescript
import {
  getDeviceData,
  getPeakValleyPrice,
  savePeakValleyPrice,
  getDeviceCurrency,
  saveDeviceCurrency,
  getCurrencyList,
  getDeviceConsumeBudget,
  getDeviceCostBudget,
  batchSaveConsumeBudget,
  batchSaveCostBudget,
  cleanDeviceData,
  exportDeviceData,
  getUnitByIndicatorCode,
  IndicatorCode,
  DateType,
  BudgetDataType,
} from '@tuya-miniapp/cloud-api';
```

Basic data fetch:

```typescript
const fetchChartData = async (devId: string, code: IndicatorCode, dateType: DateType, begin: string, end: string) => {
  const result = await getDeviceData({
    devId,
    indicatorCode: code,
    dateType,
    beginDate: begin,
    endDate: end,
  });
  return result; // { total: number; unit: string; list: { date: string; value: number }[] }
};
```

---

## Statistics Chart Page {#statistic-chart}

```tsx
import { useState } from 'react';
import { useAsyncEffect } from 'ahooks';
import { showLoading, hideLoading } from '@ray-js/ray';
import { getDeviceData, IndicatorCode, DateType } from '@tuya-miniapp/cloud-api';
import CommonCharts from '@ray-js/common-charts';

interface ChartDataItem {
  date: string;
  value: number;
}

const EnergyStatisticPage = ({ devId }: { devId: string }) => {
  const [indicatorCode, setIndicatorCode] = useState<IndicatorCode>(IndicatorCode.EleUsage);
  const [dateType, setDateType] = useState<DateType>(DateType.Day);
  const [chartData, setChartData] = useState<ChartDataItem[]>([]);
  const [total, setTotal] = useState(0);
  const [unit, setUnit] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date());

  useAsyncEffect(async () => {
    showLoading({ title: '' });
    try {
      const { beginDate, endDate } = getTimeRange(dateType, currentDate);
      const result = await getDeviceData({
        devId,
        indicatorCode,
        dateType,
        beginDate,
        endDate,
      });
      setChartData(result.list);
      setTotal(result.total);
      setUnit(result.unit);
    } finally {
      hideLoading();
    }
  }, [devId, indicatorCode, dateType, currentDate]);

  return (
    <View>
      {/* Tab: EleUsage / EleCost */}
      <TabBar
        tabs={[
          { key: IndicatorCode.EleUsage, title: Strings.getLang('eleUsage') },
          { key: IndicatorCode.EleCost, title: Strings.getLang('eleCost') },
        ]}
        activeKey={indicatorCode}
        onChange={(key) => setIndicatorCode(key as IndicatorCode)}
      />

      {/* Date type selector: Day / Week / Month / Year */}
      <DateTypeSelector value={dateType} onChange={setDateType} />

      {/* Date navigation */}
      <DateNavigation date={currentDate} dateType={dateType} onChange={setCurrentDate} />

      {/* Total display */}
      <Text>{total} {unit}</Text>

      {/* Chart from @ray-js/common-charts (ECharts-compatible option) */}
      <CommonCharts
        unit={unit}
        option={{
          backgroundColor: '#fff',
          xAxis: {
            type: 'category',
            data: chartData.map((item) => item.date),
          },
          yAxis: { type: 'value' },
          tooltip: {},
          series: [
            {
              name: indicatorCode === IndicatorCode.EleUsage
                ? Strings.getLang('eleUsage')
                : Strings.getLang('eleCost'),
              data: chartData.map((item) => item.value),
              type: dateType === DateType.Hour ? 'line' : 'bar',
            },
          ],
        }}
      />
    </View>
  );
};
```

---

## Peak-Valley Price CRUD {#peak-valley-price}

```tsx
import { useState } from 'react';
import { useAsyncEffect } from 'ahooks';
import { showLoading, hideLoading, showToast } from '@ray-js/ray';
import { getPeakValleyPrice, savePeakValleyPrice, PeakValleyPriceConfig } from '@tuya-miniapp/cloud-api';

interface PriceItem {
  price: string;
  startTime: string;
  endTime: string;
}

const PricePage = ({ devId }: { devId: string }) => {
  const [normalPrice, setNormalPrice] = useState('');
  const [peakValleyList, setPeakValleyList] = useState<PriceItem[]>([]);

  useAsyncEffect(async () => {
    showLoading({ title: '' });
    try {
      const result = await getPeakValleyPrice({ devId });
      setNormalPrice(result.config.normalPrice || '');
      setPeakValleyList(result.config.peakValleyPrice || []);
    } finally {
      hideLoading();
    }
  }, [devId]);

  const handleSave = async () => {
    const priceConfig: PeakValleyPriceConfig = {
      normalPrice,
      peakValleyPrice: peakValleyList,
    };
    const success = await savePeakValleyPrice({ devId, priceConfig });
    if (success) {
      showToast({ title: Strings.getLang('saveSuccess'), icon: 'success' });
    }
  };

  const addPriceItem = () => {
    setPeakValleyList([...peakValleyList, { price: '', startTime: '00', endTime: '06' }]);
  };

  const removePriceItem = (index: number) => {
    setPeakValleyList(peakValleyList.filter((_, i) => i !== index));
  };

  const updatePriceItem = (index: number, field: keyof PriceItem, value: string) => {
    const list = [...peakValleyList];
    list[index] = { ...list[index], [field]: value };
    setPeakValleyList(list);
  };

  return (
    <View>
      {/* Normal price input */}
      <Input value={normalPrice} onInput={(e) => setNormalPrice(e.value)} />

      {/* Peak-valley time period list (swipeable for delete) */}
      {peakValleyList.map((item, index) => (
        <SwipeableItem key={index} onDelete={() => removePriceItem(index)}>
          <TimePicker startTime={item.startTime} endTime={item.endTime}
            onChange={(start, end) => { updatePriceItem(index, 'startTime', start); updatePriceItem(index, 'endTime', end); }} />
          <Input value={item.price} onInput={(e) => updatePriceItem(index, 'price', e.value)} />
        </SwipeableItem>
      ))}

      <Button onClick={addPriceItem}>{Strings.getLang('addPeriod')}</Button>
      <Button onClick={handleSave}>{Strings.getLang('save')}</Button>
    </View>
  );
};
```

---

## Currency Settings {#currency-settings}

```tsx
import { useState } from 'react';
import { useAsyncEffect, useDebounceFn } from 'ahooks';
import { getDeviceProperty, setDeviceProperty, showToast } from '@ray-js/ray';
import {
  getCurrencyList,
  getDeviceCurrency,
  saveDeviceCurrency,
  CurrencyItem,
} from '@tuya-miniapp/cloud-api';

const CUSTOM_UNIT_KEY = 'custom_currency_unit';

const CurrencyPage = ({ devId }: { devId: string }) => {
  const [currencies, setCurrencies] = useState<CurrencyItem[]>([]);
  const [currentCurrency, setCurrentCurrency] = useState('');
  const [customUnit, setCustomUnit] = useState('');

  useAsyncEffect(async () => {
    const [list, current, property] = await Promise.all([
      getCurrencyList(),
      getDeviceCurrency({ devId }),
      getDeviceProperty({ devId, bizType: 0, propertyList: [CUSTOM_UNIT_KEY] }),
    ]);
    setCurrencies(list);
    setCurrentCurrency(current);
    if (property?.[CUSTOM_UNIT_KEY]) {
      setCustomUnit(property[CUSTOM_UNIT_KEY]);
    }
  }, [devId]);

  const handleSelectCurrency = async (code: string) => {
    await saveDeviceCurrency({ devId, currency: code });
    setCurrentCurrency(code);
    showToast({ title: Strings.getLang('saveSuccess'), icon: 'success' });
  };

  const { run: handleCustomUnitChange } = useDebounceFn(
    async (value: string) => {
      setCustomUnit(value);
      await setDeviceProperty({
        devId,
        bizType: 0,
        propertyList: [{ code: CUSTOM_UNIT_KEY, value }],
      });
    },
    { wait: 500 }
  );

  return (
    <View>
      {/* Standard currency list */}
      {currencies.map((item) => (
        <Cell
          key={item.code}
          title={`${item.symbol} (${item.code})`}
          isActive={item.code === currentCurrency}
          onClick={() => handleSelectCurrency(item.code)}
        />
      ))}

      {/* Custom currency unit input */}
      <Input
        placeholder={Strings.getLang('customUnitPlaceholder')}
        value={customUnit}
        onInput={(e) => handleCustomUnitChange(e.value)}
      />
    </View>
  );
};
```

---

## Budget Warnings {#budget-warnings}

```tsx
import { useState } from 'react';
import { useAsyncEffect, useDebounceFn } from 'ahooks';
import { showLoading, hideLoading, showToast } from '@ray-js/ray';
import {
  getDeviceConsumeBudget,
  getDeviceCostBudget,
  batchSaveConsumeBudget,
  batchSaveCostBudget,
  BudgetDataType,
  BudgetConfigItem,
  DeviceBudget,
} from '@tuya-miniapp/cloud-api';

type BudgetType = 'consume' | 'cost';

interface BudgetForm {
  day: string;
  week: string;
  month: string;
}

const BudgetPage = ({ devId, type }: { devId: string; type: BudgetType }) => {
  const [form, setForm] = useState<BudgetForm>({ day: '', week: '', month: '' });

  useAsyncEffect(async () => {
    showLoading({ title: '' });
    try {
      const budgets: DeviceBudget[] =
        type === 'consume'
          ? await getDeviceConsumeBudget({ devId })
          : await getDeviceCostBudget({ devId });

      const newForm: BudgetForm = { day: '', week: '', month: '' };
      budgets.forEach((item) => {
        if (item.dateType === BudgetDataType.Day) newForm.day = item.budget;
        if (item.dateType === BudgetDataType.Week) newForm.week = item.budget;
        if (item.dateType === BudgetDataType.Month) newForm.month = item.budget;
      });
      setForm(newForm);
    } finally {
      hideLoading();
    }
  }, [devId, type]);

  const handleSave = async () => {
    const budgetConfig: BudgetConfigItem[] = [];
    if (form.day) budgetConfig.push({ dateType: BudgetDataType.Day, budget: form.day });
    if (form.week) budgetConfig.push({ dateType: BudgetDataType.Week, budget: form.week });
    if (form.month) budgetConfig.push({ dateType: BudgetDataType.Month, budget: form.month });

    const saveFn = type === 'consume' ? batchSaveConsumeBudget : batchSaveCostBudget;
    const success = await saveFn({ devId, budgetConfig });
    if (success) {
      showToast({ title: Strings.getLang('saveSuccess'), icon: 'success' });
    }
  };

  const { run: onInput } = useDebounceFn(
    (field: keyof BudgetForm, value: string) => {
      setForm((prev) => ({ ...prev, [field]: value }));
    },
    { wait: 500 }
  );

  return (
    <View>
      <Input label={Strings.getLang('dailyBudget')} value={form.day} onInput={(e) => onInput('day', e.value)} />
      <Input label={Strings.getLang('weeklyBudget')} value={form.week} onInput={(e) => onInput('week', e.value)} />
      <Input label={Strings.getLang('monthlyBudget')} value={form.month} onInput={(e) => onInput('month', e.value)} />
      <Button onClick={handleSave}>{Strings.getLang('save')}</Button>
    </View>
  );
};
```

---

## Data Management {#data-management}

```tsx
import { getDeviceProperty, setDeviceProperty, showModal, showToast } from '@ray-js/ray';
import { cleanDeviceData, exportDeviceData, IndicatorCode, DateType } from '@tuya-miniapp/cloud-api';

const EMAIL_KEY = 'email_export_address';

const handleCleanData = async (devId: string) => {
  showModal({
    title: Strings.getLang('warning'),
    content: Strings.getLang('cleanDataConfirm'),
    success: async (res) => {
      if (res.confirm) {
        const success = await cleanDeviceData({ devId });
        if (success) {
          showToast({ title: Strings.getLang('cleanSuccess'), icon: 'success' });
        }
      }
    },
  });
};

const handleExportData = async (devId: string, email: string, dateType: DateType, beginDate: string, endDate: string) => {
  await setDeviceProperty({
    devId,
    bizType: 0,
    propertyList: [{ code: EMAIL_KEY, value: email }],
  });

  const success = await exportDeviceData({
    devId,
    dateType,
    beginDate,
    endDate,
    email,
    indicatorCodes: [IndicatorCode.EleUsage, IndicatorCode.EleCost],
  });

  if (success) {
    showToast({ title: Strings.getLang('exportSubmitted'), icon: 'success' });
  }
};

const getSavedEmail = async (devId: string): Promise<string> => {
  const result = await getDeviceProperty({
    devId,
    bizType: 0,
    propertyList: [EMAIL_KEY],
  });
  return result?.[EMAIL_KEY] || '';
};
```

---

## Date Navigation Helper {#date-navigation}

```typescript
import { DateType } from '@tuya-miniapp/cloud-api';

interface TimeRange {
  beginDate: string;
  endDate: string;
}

const padTwo = (n: number) => String(n).padStart(2, '0');

const formatDate = (date: Date, dateType: DateType): string => {
  const y = date.getFullYear();
  const m = padTwo(date.getMonth() + 1);
  const d = padTwo(date.getDate());
  const h = padTwo(date.getHours());

  switch (dateType) {
    case DateType.Hour: return `${y}${m}${d}${h}`;
    case DateType.Day: return `${y}${m}${d}`;
    case DateType.Month: return `${y}${m}`;
    default: return `${y}${m}${d}`;
  }
};

const getTimeRange = (dateType: DateType, date: Date): TimeRange => {
  const current = new Date(date);

  switch (dateType) {
    case DateType.Hour: {
      const begin = new Date(current);
      begin.setHours(0, 0, 0, 0);
      const end = new Date(current);
      end.setHours(23, 0, 0, 0);
      return { beginDate: formatDate(begin, dateType), endDate: formatDate(end, dateType) };
    }
    case DateType.Day: {
      const begin = new Date(current.getFullYear(), current.getMonth(), 1);
      const end = new Date(current.getFullYear(), current.getMonth() + 1, 0);
      return { beginDate: formatDate(begin, dateType), endDate: formatDate(end, dateType) };
    }
    case DateType.Month: {
      const begin = new Date(current.getFullYear(), 0, 1);
      const end = new Date(current.getFullYear(), 11, 1);
      return { beginDate: formatDate(begin, dateType), endDate: formatDate(end, dateType) };
    }
    default:
      return { beginDate: formatDate(current, dateType), endDate: formatDate(current, dateType) };
  }
};

const navigateDate = (date: Date, dateType: DateType, direction: 1 | -1): Date => {
  const result = new Date(date);

  switch (dateType) {
    case DateType.Hour:
      result.setDate(result.getDate() + direction);
      break;
    case DateType.Day:
      result.setMonth(result.getMonth() + direction);
      break;
    case DateType.Month:
      result.setFullYear(result.getFullYear() + direction);
      break;
  }

  return result;
};

export { getTimeRange, navigateDate, formatDate };
```
