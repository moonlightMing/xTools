import { Cascader, TimePicker } from "antd";
import { CascaderOptionType } from "antd/lib/cascader";
import moment from "moment";
import React, { forwardRef, useState } from "react";

const options: CascaderOptionType[] = [
  {
    children: ((): CascaderOptionType[] => {
      const arr = [] as CascaderOptionType[];
      const oneMonthDays = moment.duration(1, 'month').asDays();
      for (let i = 1; i <= oneMonthDays; i++) {
        arr.push({ label: `${i}日`, value: `${i}` })
      }
      return arr
    })(),
    label: '每月',
    value: 'month'
  },
  {
    children: [
      { label: '周一', value: '1' },
      { label: '周二', value: '2' },
      { label: '周三', value: '3' },
      { label: '周四', value: '4' },
      { label: '周五', value: '5' },
      { label: '周六', value: '6' },
      { label: '周日', value: '7' },
    ],
    label: '每周',
    value: 'week',
  },
  {
    label: '每天',
    value: 'day',
  }
]

const LoopInput = ({ value = { cycle: [], time: moment() }, onChange }: any, ref: any) => {
  const [cycle, setCycle] = useState(value.cycle || []);
  const [time, setTime] = useState(value.time || moment().endOf('day'));

  const triggerChange = (changedValue: { cycle?: string[], time?: moment.Moment }) => {
    if (onChange) {
      onChange(Object.assign({}, { cycle, time }, changedValue));
    }
  }

  return (
    <span ref={ref}>
      <Cascader
        value={"cycle" in value ? value.cycle : cycle}
        style={{ width: 'auto', marginRight: '5px' }}
        options={options}
        changeOnSelect={true}
        // tslint:disable-next-line: jsx-no-lambda
        onChange={v => {
          setCycle(v)
          triggerChange({ cycle: v })
        }}
      />
      <TimePicker
        value={"time" in value ? value.time : time}
        // tslint:disable-next-line: jsx-no-lambda
        onChange={t => {
          setTime(t)
          triggerChange({ time: t })
        }}
      />
    </span>
  );
}

export default forwardRef(LoopInput);