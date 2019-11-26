import sys
import re


if __name__ == '__main__':

	input_file = sys.argv[1]
	output_file_x = sys.argv[2]
	output_file_y = sys.argv[3]

	line_pattern = r'\s*(?P<lat>\d{2,3})\s+(?P<lat_min>\d{2})\s+(?P<lat_sec>\d{2})\s+(?P<lat_direction>[A-Za-z]{2})\s+'\
                   r'(?P<lon>\d{2,3})\s+(?P<lon_min>\d{2})\s+(?P<lon_sec>\d{2})\s+(?P<lon_direction>[A-Za-z]{2})\s*'
	pattern = re.compile(line_pattern)

	degrees = []

	with open(input_file) as f_input:

		line = f_input.readline()

		while line:

			print(line)

			match = pattern.search(line)

			if match:

				print('match')

				match_dict = match.groupdict()

				if match_dict['lat_direction'].upper() == 'LS':
					# Lintang Selatan
					lat_sign = -1
				else:
					lat_sign = 1

				if match_dict['lon_direction'].upper() == 'BB':
					# Bujur Barat
					lon_sign = -1
				else:
					lon_sign = 1

				lat_degree = int(match_dict['lat']) + int(match_dict['lat_min']) / 60.0 + int(match_dict['lat_sec']) / 3600.0
				lon_degree = int(match_dict['lon']) + int(match_dict['lon_min']) / 60.0 + int(match_dict['lon_sec']) / 3600.0

				if match_dict['lat_direction'].upper() == 'LS':
					# Lintang Selatan
					lat_degree *= -1

				if match_dict['lon_direction'].upper() == 'BB':
					# Bujur Barat
					lon_degree *= -1

				print(lon_degree, lat_degree)

				degrees.append((lon_degree, lat_degree))
			else:
				degrees.append((None, None))

			line = f_input.readline()

	with open(output_file_x, "w") as f_out_x:
		with open(output_file_y, "w") as f_out_y:
			for lon_degree, lat_degree in degrees:

				is_null = (lon_degree is None or lat_degree is None) or (not lon_degree and not lat_degree)

				if is_null:
					f_out_x.write('\n')
					f_out_y.write('\n')
				else:
					f_out_x.write(str(lon_degree))
					f_out_x.write('\n')
					f_out_y.write(str(lat_degree))
					f_out_y.write('\n')
