select i.id, name, standard_cost as cost
from adm_items_standard_costs sc, int_items i
where sc.id_int_items = i.id
and down_date >= now() and i.status = 1;
