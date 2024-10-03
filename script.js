fetch("data.json")
  .then((response) => response.json())
  .then((data) => {
    const tableHeader = document.getElementById('tableHeader')
    const tableBody = document.getElementById("tableBody");
    const sortSalaryButtonMax = document.getElementById("sortSalaryButtonMax");
    const sortSalaryButtonMin = document.getElementById("sortSalaryButtonMin");
    const sortCompanyButton = document.getElementById("sortCompanyButton");
    const resetSortButton = document.getElementById("resetSortButton");

    // Делаем объект с массивами плоским

    function createArray(obj) {

      // let flatArray = [];
      //
      // for (let key in obj) {
      //
      //   let keyIndex = obj[key];
      //
      //   if (Array.isArray(keyIndex)) {
      //     flatArray = flatArray.concat(createArray(keyIndex));
      //   } else {
      //     flatArray.push(keyIndex);
      //   }
      // };
      // return flatArray;

      /**
       * [DENIS]
       * Немного переделал.
       * В дате значением obj[key] всегда является массив, нет смысла его чекать
       * */
      let flatArray = []
      for (let key in obj) {
        let someRootEmployees = obj[key];
        for (let rootEmployee of someRootEmployees) {
          flatArray.push(
            ...unwrapEmployeeIntoArray(rootEmployee)
          )
        }
      }
      return flatArray
    };

    /**
     * [DENIS]
     * Типы просто для удобства
     * */

    /** @typedef {{
     * id: string;
     * name: string;
     * role: [ string, string ];
     * workload: string;
     * salary: string;
     * subordinates?: AnyEmployee[];
     }} AnyEmployee */

    /** @typedef { AnyEmployee & {
     * company: [ string, string ];
     } } RootEmployee */

    /** @typedef { RootEmployee } EmployeeWithEnsuredCompany */

    /**
     * [DENIS]
     * Рекурсивная функция
     * На вход - сотрудник
     * На выходе - обязательно массив сотрудников, даже если у сотрудника на входе не было подчиненных
     *
     * @param { EmployeeWithEnsuredCompany } employee
     * @returns { EmployeeWithEnsuredCompany[] } */
    function unwrapEmployeeIntoArray(employee) {
      // Если нет подчиненных -
      if (!employee.subordinates) {
        return [ employee ]
      }

      const unwrappedSubordinates = []
      for (let subordinate of employee.subordinates) {
        const subordinateWithEnsuredCompany = { ...subordinate, company: employee.company }
        unwrappedSubordinates.push(...unwrapEmployeeIntoArray(subordinateWithEnsuredCompany))
      }
      return [ employee, ...unwrappedSubordinates ]
    }

    const allEmployees = createArray(data);

    // [DENIS] Проверка того, что самый глубокий подчиненный анврапнулся
    console.log('find deepest employee', allEmployees.find(it => it.id === '3369d912-9cfe-4e43-9e31-d6f510c068bc'))

    // Функция для создания ячеек с информацией

    function createRows(employees) {
      employees.forEach((employee) => {
        const row = document.createElement("tr");
        row.addEventListener("click", () => showEmployeeDetails(employee));
        row.innerHTML = `
          <td>${employee.name}</td>
          <td>${employee.role[1]}</td>
          <td>${employee.salary}</td>
          <td>${employee.company[1]}</td>
          <td>${employee.subordinates ? employee.subordinates.length : 0}</td>
        `;
        tableBody.appendChild(row);
      });
    };

    /** [DENIS]
     * Перерендер хедера таблицы для сотрудников и компаний
     * */
    /** @param { string[] } array */
    function createTableHeader(array) {
      tableHeader.innerHTML = ''
      array.forEach(it => {
        const element = document.createElement('th')
        element.textContent = it
        tableHeader.appendChild(element)
      })
    }
    function createEmployeesHeader() {
      createTableHeader([ 'Имя', 'Роль', 'Зарплата', 'Компания', 'Подчиненных' ])
    }
    function createCompaniesHeader() {
      createTableHeader([ 'ID компании', 'Название', 'Сумма' ])
    }

    // Функция для сортировки списка по зарплате (От наибольшей к наименьшей)

    function sortEmployeesBySalaryMax(employees) {
      return employees.slice().sort((a, b) => {
        const salaryA = Number(a.salary.replace("$", ""));
        const salaryB = Number(b.salary.replace("$", ""));
        return salaryB - salaryA;
      });
    };

    // функция для сортировки списка по зарплате (От наименьшей к наибольшей)

    function sortEmployeesBySalaryMin(employees) {
      return employees.slice().sort((a, b) => {
        const salaryA = Number(a.salary.replace("$", ""));
        const salaryB = Number(b.salary.replace("$", ""));
        return salaryA - salaryB;
      });
    };

    // Функция для сортировки списка с группировкой сотрудников по компаниям

    function sortEmployeesByCompany(employees) {
      return employees.slice().sort((a, b) => {
        return a.company[1].localeCompare(b.company[1]);
      });
    };

    // Функция для отрисовки окна с подробной информацией о сотруднике

    function showEmployeeDetails(employee) {
      const modal = document.createElement("div");
      modal.classList.add("modal");
      const modalContent = document.createElement("div");
      modalContent.classList.add("modal-content");
      const closeButton = document.createElement("button");
      closeButton.classList.add("close");
      closeButton.textContent = "X";

      // Отрисовка подчиненных

      let subordinateInfo = "";
      if (employee.subordinates) {
        subordinateInfo = `<h3>Подчиненные</h3>
          <ul>`;
        employee.subordinates.forEach((subordinate) => {
          subordinateInfo += `<li>${subordinate.name} - Зарплата: ${subordinate.salary}, Загруженность: ${subordinate.workload}</li>`;
        });
        subordinateInfo += `</ul>`;
      };

      // Отрисовка информации

      modalContent.innerHTML = `
        <h2>${employee.name}</h2>
        <p><b>Компания:</b> ${employee.company[1]}</p>
        <p><b>Роль:</b> ${employee.role[1]}</p>
        <p><b>Зарплата:</b> ${employee.salary}</p>
        <p><b>Загруженность:</b> ${employee.workload}</p>
        <p><b>Подчиненных:</b> ${
          employee.subordinates ? employee.subordinates.length : 0
        }</p>
        ${subordinateInfo} 
      `;

      // Функция для закрытия окна с информацией по клику

      closeButton.addEventListener("click", () => modal.remove());

      // Добавляем элементы друг к другу

      modalContent.appendChild(closeButton);
      modal.appendChild(modalContent);
      document.body.appendChild(modal);
    };

    // Функция показа всего списка

    function showEmployees(employees) {
      tableBody.innerHTML = "";
      createEmployeesHeader()
      createRows(employees);
    };

    // Функция обнуления сортировки

    function resetSorting() {
      showEmployees(allEmployees);
    };

    /** @typedef {{
     * id: string;
     * name: string;
     * salarySum: number;
     }} CompanyResult */

    /**
     * [DENIS]
     * Получить компании из даты
     *
     * @param { EmployeeWithEnsuredCompany[] } employees
     * @returns { CompanyResult[] }
    */
    function getCompanies(employees) {
      /** @type { Record<string, CompanyResult> } */
      const mapByCompanyId = {}
      employees.forEach(employee => {
        const companyId = employee.company[0]
        if (!mapByCompanyId[companyId]) {
          mapByCompanyId[companyId] = {
            id: companyId,
            name: employee.company[1],
            salarySum: 0,
          }
        }
        mapByCompanyId[companyId].salarySum += Number(employee.salary.replace('$', ''))
      })
      return Object.values(mapByCompanyId)
    }

    /** [DENIS]
     * Отсортировать компании
     *
     * @param { CompanyResult[] } companies
     * @returns { CompanyResult[] } */
    function sortBySalarySum(companies) {
      return companies.sort((a, b) => b.salarySum - a.salarySum)
    }

    /** [DENIS]
     * Рендер компаний
     *
     * @param { CompanyResult[] } companies */
    function showCompanies(companies) {
      createCompaniesHeader()
      tableBody.innerHTML = "";
      companies.forEach((company) => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${company.id}</td>
          <td>${company.name}</td>
          <td>${company.salarySum}</td>
        `;
        tableBody.appendChild(row);
      });
    };

    // Кнопки

    sortSalaryButtonMax.addEventListener("click", () => {
      showEmployees(sortEmployeesBySalaryMax(allEmployees));
    });

    sortSalaryButtonMin.addEventListener("click", () => {
      showEmployees(sortEmployeesBySalaryMin(allEmployees));
    });

    sortCompanyButton.addEventListener("click", () => {
      showEmployees(sortEmployeesByCompany(allEmployees));
    });

    resetSortButton.addEventListener("click", resetSorting);

    /** [DENIS]
     * Новая кнопка
     * */
    document.getElementById('getCompaniesBySalarySum').addEventListener('click', () => {
      showCompanies(
        sortBySalarySum(
          getCompanies(allEmployees)
        )
      )
    })

    showEmployees(allEmployees);
  });
