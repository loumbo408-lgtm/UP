-- Catalogue initial des lieux publics répertoriés (Libreville / Port-Gentil).
-- Seuls ces établissements peuvent accueillir une mission UP.

insert into public.venues (name, category, address, district, city, is_approved) values
  ('Le Cristal',            'restaurant',   'Boulevard du Bord de Mer',       'Centre-ville', 'Libreville',  true),
  ('La Dolce Vita',         'restaurant',   'Quartier Louis',                 'Louis',        'Libreville',  true),
  ('Le Phare du Large',     'restaurant',   'Pointe Denis',                   'Pointe Denis', 'Libreville',  true),
  ('Radisson Blu Lounge',   'hotel_lounge', 'Baie des Rois',                  'Batterie IV',  'Libreville',  true),
  ('Nomad Cafe',            'cafe',         'Avenue Colonel Parant',          'Centre-ville', 'Libreville',  true),
  ('Salon Ekaba',           'salon',        'Boulevard Triomphal',            'Nombakele',    'Libreville',  true),
  ('Institut Français',     'culture',      'Boulevard de l''Independance',   'Centre-ville', 'Libreville',  true),
  ('Musee des Arts',        'culture',      'Boulevard du Bord de Mer',       'Centre-ville', 'Libreville',  true),
  ('Espace Evenementiel Nzeng', 'événement','Nzeng-Ayong',                    'Nzeng-Ayong',  'Libreville',  true),
  ('Le Tropicana',          'restaurant',   'Route de la Sabliere',           'Sabliere',     'Libreville',  true),
  ('Hotel Hibiscus Lounge', 'hotel_lounge', 'Boulevard Leon Mba',             'Centre',       'Port-Gentil', true),
  ('Cafe du Port',          'cafe',         'Avenue Savorgnan de Brazza',     'Centre',       'Port-Gentil', true)
on conflict do nothing;
