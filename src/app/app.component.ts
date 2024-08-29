import { Component } from '@angular/core';
import { AppSettingsService } from './app.services';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'test-job';
  lastestData: any = [];
  monthsArr: any;
  constructor(
    private appSettingsService: AppSettingsService
  ) { }

  ngOnInit() {
    this.appSettingsService.getJSON().subscribe(data => {
      // console.log(data);

      let months: any =
      {
        January: 0,
        February: 1,
        March: 2,
        April: 3,
        May: 4,
        June: 5,
        July: 6,
        August: 7,
        September: 8,
        October: 9,
        November: 10,
        December: 11
      };
      this.monthsArr = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

      const now = new Date();
      const month = now.getMonth();
      this.monthsArr.sort(function (m1: string | number, m2: string | number) {
        let n1 = months[m1], n2 = months[m2];
        if (n1 < month) {
          n1 = n1 + 12;
        }
        if (n2 < month) {
          n2 = n2 + 12;
        }
        return n1 - n2;
      });

      const year = now.getFullYear();
      const uniqueArray = data.filter(
        (obj: any, index: any, self: any[]) =>
          index === self.findIndex(
            (t: any) => t.CompanyName === obj.CompanyName &&
              t.MonthID === obj.MonthID &&
              t.YearID === obj.YearID &&
              (t.YearID === year || (t.YearID === year - 1 && t.MonthID > month))
          )
      );
      const gr = this.regroupByCategory(uniqueArray);

      for (let k in gr) {
        let comp = this.calculate(k, gr[k], month);
        this.lastestData.push(comp);
      }

    });
  }

  regroupByCategory(jsonArray: any[]) {
    return jsonArray.reduce((grouped: { [x: string]: any[]; }, item: { CompanyName: string | number; }) => {
      if (!grouped[item.CompanyName]) {
        grouped[item.CompanyName] = [];
      }
      grouped[item.CompanyName].push(item);
      return grouped;
    }, {});
  }

  calculate(name: string, company: any, startMonth: number) {
    let com: any = {};
    let profit: number[] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    let income: number[] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    let expenses: number[] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    // const sortCom = company.sort((a: { MonthID: number; }, b: { MonthID: number; }) => a.MonthID - b.MonthID);
    com.name = name;
    company.forEach((element: any) => {
      profit[element.MonthID - 1] = element.TotalIncome - element.TotalExpenses;
      income[element.MonthID - 1] = element.TotalIncome;
      expenses[element.MonthID - 1] = element.TotalExpenses;

    });
    let i1 = income.slice(0, startMonth);
    let i2 = income.slice(startMonth);
    let lastIncome = i2.concat(i1);
    let p1 = profit.slice(0, startMonth);
    let p2 = profit.slice(startMonth);
    let lastProfit = p2.concat(p1);
    let e1 = expenses.slice(0, startMonth);
    let e2 = expenses.slice(startMonth);
    let lastExpenses = e2.concat(e1);

    let month: any = [];
    for (let i = 0; i < lastIncome.length; i++) {
      const ip = {
        income: lastIncome[i],
        profit: lastProfit[i],
        nothingChange: i > 0 && lastExpenses[i] === lastExpenses[i - 1] && lastIncome[i] === lastIncome[i - 1] ? true : false,
        netIncome: i > 0 && lastIncome[i - 1] > 0 ? (((lastIncome[i] - lastIncome[i - 1]) / lastIncome[i - 1]) * 100).toFixed(2) : 0,
        netProfit: i > 0 && lastProfit[i - 1] > 0 ? (((lastProfit[i] - lastProfit[i - 1]) / lastProfit[i - 1]) * 100).toFixed(2) : 0,
        month: (startMonth + i) % 12 + 1
      }
      month.push(ip);
    }

    com.month = month;
    return com;
  }
}
