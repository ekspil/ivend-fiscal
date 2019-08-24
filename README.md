# Fiscal service



* Send receipts to UMKA
* Queue all receipts processing them in the background
* Return all information about receipts


Receipt

email: string
place: string
inn: string
name: string
price: decimal
extId: string
timestamp: string
payType: string
sno: string
status: enum





Бек

1) AggregationAPI
1.1) Метод для инкассации + Документация в апи аггрегации (2h)
____
2h

2) FiscalService (рефакторинг, вынос в отдельный сервис)
2.1) Бутстрап сервиса (1h)
2.2) Перенос текущей логики (3h)
2.3) Создание чеков + очереди чеков (2h)
2.4) Выгрузка информации по чекам (1h)
____
7h

3) Graphql-api
3.1) Добавить выбор группы при выгрузке статистики (по умолчанию все группы) (1h)
3.2) Добавить тип для чеков и резолверы к нему (1h)
3.3) Добавить новый тип Инкассация, настроить таблицы и классы (2h)
3.4) Настроить выгрузку инкассаций (1h)
3.5) Добавить мутацию для инкассации (1h)
_
6h

4) Логгирование
4.1) Бутстрап graylog (2-3h)
4.2) Разработка библиотеки для централизованного логгирования (2h)
4.3) Подключение логгера во все проекты (2h)
_
6-7h


5) Frontend
1) Добавить раздел инкассация в  статистике (1h)
2) Добавить фильтр по группам (1h)
3) Выгрузка инкассаций по автоматам (общая) (3h)
4) Выгрузка инкассаций конкретного автомата  (3h)
___
8h


 Для graylog потребуется отдельный сервер (2-4 гигабайт RAM)
