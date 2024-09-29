fetch("data.json")
  .then((response) => response.json())
  .then((data) => {
    const tableBody = document.getElementById("tableBody");
    const sortSalaryButtonMax = document.getElementById("sortSalaryButtonMax");
    const sortSalaryButtonMin = document.getElementById("sortSalaryButtonMin");
    const sortCompanyButton = document.getElementById("sortCompanyButton");
    const resetSortButton = document.getElementById("resetSortButton");

    // Делаем объект с массивами плоским

    const allEmployees = Object.values(data).flat();

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
    }

    // Функция для сортировки списка по зарплате (От наибольшей к наименьшей)

    function sortEmployeesBySalaryMax(employees) {
      return employees.slice().sort((a, b) => {
        const salaryA = Number(a.salary.replace("$", ""));
        const salaryB = Number(b.salary.replace("$", ""));
        return salaryB - salaryA;
      });
    }

    // функция для сортировки списка по зарплате (От наименьшей к наибольшей)

    function sortEmployeesBySalaryMin(employees) {
      return employees.slice().sort((a, b) => {
        const salaryA = Number(a.salary.replace("$", ""));
        const salaryB = Number(b.salary.replace("$", ""));
        return salaryA - salaryB;
      });
    }

    // Функция для сортировки списка с группировкой сотрудников по компаниям

    function sortEmployeesByCompany(employees) {
      return employees.slice().sort((a, b) => {
        return a.company[1].localeCompare(b.company[1]);
      });
    }

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
      }

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
      modal.addEventListener("click", () => {
        modal.remove();
      });

      // Добавляем элементы друг к другу

      modalContent.appendChild(closeButton);
      modal.appendChild(modalContent);
      document.body.appendChild(modal);
    }

    // Функция показа всего списка

    function showEmployees(employees) {
      tableBody.innerHTML = "";
      createRows(employees);
    }

    // Функция обнуления сортировки

    function resetSorting() {
      showEmployees(allEmployees);
    }

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

    showEmployees(allEmployees);
  });
