select * from adm_users;

select id, username, name, mail, password, active
from adm_users
where id = 9;

update adm_accounts
set logo_address = 'lorem-ipsum.jpg'
where id = 1;