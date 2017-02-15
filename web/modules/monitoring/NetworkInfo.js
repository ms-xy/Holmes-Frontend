'use strict';

function NetworkInfoTab(tab) {
	var container = $("<div>").addClass("container");
	tab.append(container);

	var interval = false,
	machineUuid = false;

	var tables = {
		interfaces: {
			el: $("<div>").addClass("col-md-12"),
			table: new Table({
				columns: [
					{ i: "ID",        th: "ID"         },
					{ i: "Name",      th: "Name"       },
					{ i: "IP",        th: "IP",        },
					{ i: "Netmask",   th: "Netmask",   },
					{ i: "Broadcast", th: "Broadcast", },
					{ i: "Scope",     th: "Scope"      }
				]
			})
		}
	};

	container.append(
		tables.interfaces.table.el()
		);

	function update(context) {
		ajax("monitoring", "get_netinfo", {machineUuid: machineUuid}, function(response){
			var result = response.result;
			tables.interfaces.table.setData(result.Interfaces);
		});
	}

	function stop() {
		if (interval) {
			window.clearInterval(interval);
		}
	}

	function show(_machineUuid) {
		machineUuid = _machineUuid
		this.stop()
		// update(this);
		// interval = window.setInterval(update, 1000, this);
	}

		// build return object
		var o = {
			show: show,
			stop: stop
		};
		return o;
	}
